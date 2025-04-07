import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FileInput,
  Label,
  Textarea,
  TextInput,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { useAppSelector } from "../redux/hooks";
import { useFormik } from "formik";
import * as Yup from "yup";
import { makeSlug, uploadImages, uploadToS3 } from "../utils/helper";
import { useNavigate } from "react-router";

interface Section {
  id: number;
  picture?: string;
  subHeading?: string;
  sectionText?: string;
}

const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME;

const NewPostPage = () => {
  const navigate = useNavigate();
  const blogList = useAppSelector((state) => state.user.blogList);

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [authError, setAuthError] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const formik = useFormik({
    initialValues: {
      headerImage: "",
      title: "",
      introText: "",
      sections: [] as Section[],
    },
    validationSchema: Yup.object().shape({
      headerImage: Yup.string().optional(),
      title: Yup.string().required("Required"),
      introText: Yup.string().required("Required"),
      sections: Yup.array(
        Yup.object().shape({
          id: Yup.number(),
          picture: Yup.string().optional(),
          subHeading: Yup.string().optional(),
          sectionText: Yup.string().optional(),
        })
      ).optional(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setAuthError(""); // Clear previous errors
      setShowToast(false);

      try {
        const imageResult = await uploadImages(images);

        if (imageResult !== "success") {
          throw new Error(
            imageResult === "error"
              ? "Upload failed"
              : "Unknown response from server"
          );
        }

        const slug = makeSlug(values.title);

        const updatedData = [
          ...blogList,
          {
            ...values,
            id: blogList[blogList.length - 1]?.id
              ? blogList[blogList.length - 1]?.id + 1
              : 1,
            slug: slug,
            createdAt: new Date().toISOString(),
          },
        ];

        const result = await uploadToS3(updatedData);

        if (result !== "success") {
          throw new Error(
            result === "error"
              ? "Upload failed"
              : "Unknown response from server"
          );
        }

        navigate("/");
      } catch (err: unknown) {
        // Better to use unknown than any
        const error =
          err instanceof Error ? err : new Error("Upload operation failed");
        console.error("Upload error:", error); // Use console.error for errors

        setAuthError(
          error.message.includes("credentials")
            ? "Authentication failed"
            : "Upload failed. Please try again."
        );
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleDelete = (idToDelete: string) => {
    setSections((prevSections) => {
      const newArr = prevSections.filter((item) => item.id !== idToDelete);
      return newArr;
    });
  };

  return (
    <DashboardLayout>
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-start lg:justify-between gap-x-3">
          <h3 className="text-center lg:text-start">Blog details</h3>

          <div className="btn-group" id="dropdown-icon-demo">
            <button
              type="button"
              className="btn btn-dark p-3"
              aria-expanded="false"
              onClick={() => {
                formik.setValues({ ...formik.values, sections: [...sections] });
                formik.handleSubmit();
              }}
            >
              {loading ? (
                /* From Uiverse.io by ashish-yadv */
                <div className="loader">
                  <li className="ball"></li>
                  <li className="ball"></li>
                  <li className="ball"></li>
                </div>
              ) : (
                <>
                  SAVE BLOG POST
                  <i className="far fa-long-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </div>

        {/* INPUT ELEMENTS */}
        <div>
          <div className="flex flex-col justify-start gap-y-3">
            <div id="fileUpload" className="max-w-lg">
              <Label className="mb-2 block text-black" htmlFor="headerImage">
                Header background image (optional)
              </Label>
              <FileInput
                id="headerImage"
                name="headerImage"
                accept="image/*"
                onChange={(event: any) => {
                  console.log(event.target.files[0]);
                  handleImageChange(event);
                  formik.setFieldValue(
                    "headerImage",
                    `https://${BUCKET_NAME}.s3.amazonaws.com/images/${
                      event.target.files[0].name
                    }`
                  );
                }}
              />

              {formik?.values.headerImage && (
                <small className="mt-2">{`https://${BUCKET_NAME}.s3.amazonaws.com/images/${formik?.values.headerImage}`}</small>
              )}

              <span
                id="error"
                className="text-center eerror mt-2 small text-danger"
              >
                {formik?.errors?.headerImage}
              </span>
            </div>

            <div className="max-w-lg">
              <div className="mb-2 block">
                <Label className="text-black" htmlFor="title">
                  Blog title
                </Label>
              </div>
              <TextInput
                id="title"
                name="title"
                type="text"
                required
                onChange={formik.handleChange}
              />
              <span
                id="error"
                className="text-center eerror mt-2 small text-danger"
              >
                {formik?.errors?.title}
              </span>
            </div>

            <div>
              <div className="mb-2 block">
                <Label className="text-black" htmlFor="introText">
                  Intro text
                </Label>
              </div>
              <Textarea
                id="introText"
                name="introText"
                placeholder="Enter text..."
                required
                rows={10}
                onChange={formik.handleChange}
              />
              <span
                id="error"
                className="text-center eerror mt-2 small text-danger"
              >
                {formik?.errors?.introText}
              </span>
            </div>
          </div>

          <div className="my-3">
            <h4>Sections</h4>
          </div>

          {/* SECTIONS */}
          {sections?.length > 0 && (
            <div className="flex flex-col justify-start gap-y-5 my-5">
              {sections?.map((curr, index) => (
                <div
                  key={curr.id}
                  className="flex flex-col justify-start gap-y-3"
                >
                  <div className="flex flex-row justify-between">
                    <h4>Section {index + 1}</h4>

                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="25"
                        height="25"
                        viewBox="0,0,256,256"
                        className="cursor-pointer mx-auto"
                        onClick={() => handleDelete(curr.id)}
                      >
                        <g
                          fill="#fa5252"
                          fillRule="nonzero"
                          stroke="none"
                          strokeWidth="1"
                          strokeLinecap="butt"
                          strokeLinejoin="miter"
                          strokeMiterlimit="10"
                          strokeDasharray=""
                          strokeDashoffset="0"
                          fontFamily="none"
                          fontWeight="none"
                          fontSize="none"
                          textAnchor="none"
                          style={{ mixBlendMode: "normal" }}
                        >
                          <g transform="scale(8.53333,8.53333)">
                            <path d="M14.98438,2.48633c-0.55152,0.00862 -0.99193,0.46214 -0.98437,1.01367v0.5h-5.5c-0.26757,-0.00363 -0.52543,0.10012 -0.71593,0.28805c-0.1905,0.18793 -0.29774,0.44436 -0.29774,0.71195h-1.48633c-0.36064,-0.0051 -0.69608,0.18438 -0.87789,0.49587c-0.18181,0.3115 -0.18181,0.69676 0,1.00825c0.18181,0.3115 0.51725,0.50097 0.87789,0.49587h18c0.36064,0.0051 0.69608,-0.18438 0.87789,-0.49587c0.18181,-0.3115 0.18181,-0.69676 0,-1.00825c-0.18181,-0.3115 -0.51725,-0.50097 -0.87789,-0.49587h-1.48633c0,-0.26759 -0.10724,-0.52403 -0.29774,-0.71195c-0.1905,-0.18793 -0.44836,-0.29168 -0.71593,-0.28805h-5.5v-0.5c0.0037,-0.2703 -0.10218,-0.53059 -0.29351,-0.72155c-0.19133,-0.19097 -0.45182,-0.29634 -0.72212,-0.29212zM6,9l1.79297,15.23438c0.118,1.007 0.97037,1.76563 1.98438,1.76563h10.44531c1.014,0 1.86538,-0.75862 1.98438,-1.76562l1.79297,-15.23437z"></path>
                          </g>
                        </g>
                      </svg>
                    </span>
                  </div>
                  <div id="fileUpload" className="max-w-lg">
                    <Label
                      className="mb-2 block text-black"
                      htmlFor="sectionImage"
                    >
                      Section image (optional)
                    </Label>
                    <FileInput
                      id="sectionImage"
                      name="sectionImage"
                      accept="image/*"
                      onChange={(event: any) => {
                        console.log(event.target.files[0], curr);
                        handleImageChange(event);

                        setSections((prev) => {
                          const updatedSections = [...prev];
                          updatedSections[index] = {
                            ...updatedSections[index],
                            picture: `https://${BUCKET_NAME}.s3.amazonaws.com/images/${
                              event.target.files[0].name
                            }`,
                          };
                          return updatedSections;
                        });
                      }}
                    />

                    {curr?.picture && (
                      <small className="mt-2">{`https://${BUCKET_NAME}.s3.amazonaws.com/images/${curr?.picture}`}</small>
                    )}
                  </div>

                  <div className="max-w-lg">
                    <div className="mb-2 block">
                      <Label className="text-black" htmlFor="subHeading">
                        Section subheading (optional)
                      </Label>
                    </div>
                    <TextInput
                      id="subHeading"
                      name="subHeading"
                      type="text"
                      onChange={(event) => {
                        setSections((prev) => {
                          const updatedSections = [...prev];
                          updatedSections[index] = {
                            ...updatedSections[index],
                            subHeading: event.target.value,
                          };
                          return updatedSections;
                        });
                      }}
                    />
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label className="text-black" htmlFor="sectionText">
                        Section text
                      </Label>
                    </div>
                    <Textarea
                      id="sectionText"
                      name="sectionText"
                      placeholder="Enter text..."
                      rows={10}
                      onChange={(event) => {
                        setSections((prev) => {
                          const updatedSections = [...prev];
                          updatedSections[index] = {
                            ...updatedSections[index],
                            sectionText: event.target.value,
                          };
                          return updatedSections;
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="btn-group my-5" id="dropdown-icon-demo">
            <button
              type="button"
              className="btn btn-dark"
              aria-expanded="false"
              onClick={() =>
                setSections((prev) => [
                  ...prev,
                  {
                    id: sections[sections.length - 1]?.id
                      ? sections[sections.length - 1]?.id + 1
                      : 1,
                    picture: "",
                    subHeading: "",
                    sectionText: "",
                  },
                ])
              }
            >
              Add section
            </button>
          </div>
        </div>
      </div>

      {(showToast || authError) && (
        <Toast className="fixed top-2 left-2 px-3">
          <div className="ml-3 text-sm font-normal">{authError}</div>
          <ToastToggle
            onDismiss={() => {
              setShowToast(false);
              setAuthError("");
            }}
          />
        </Toast>
      )}
    </DashboardLayout>
  );
};

export default NewPostPage;
