import { useAppDispatch, useAppSelector } from "../redux/hooks";
import "../assets/page-account-settings.css";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { getJsonFileFromS3, uploadToS3 } from "../utils/helper";
import { updateBlogList } from "./Auth/_redux/userSlice";
import { Link } from "react-router";
import { AppLinks } from "../utils/Routes";

const Dashboard = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.user.user);
  const blogList = useAppSelector((state) => state.user.blogList);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [posts, setPosts] = useState<any[]>(blogList);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const handleCloseModal = () => {
    setSelectedPost(null);
    setOpenModal(false);
  };

  const getPosts = async () => {
    setLoading(true);

    try {
      const jsonData = await getJsonFileFromS3();
      console.log("first===== ", jsonData);
      dispatch(updateBlogList({ blog_list: jsonData }));
      setPosts(jsonData);
    } catch (err: any) {
      console.log("error: ", err.message);
      setAuthError(err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: any) => {
    setLoading(true);

    const updatedData = posts.filter((cur) => cur.id !== postId);
    setPosts(updatedData);

    console.log("updatedData=== ", updatedData);

    try {
      const result = await uploadToS3(updatedData);

      if (result !== "success") {
        throw new Error(
          result === "error" ? "Upload failed" : "Unknown response from server"
        );
      }
      getPosts();
      setAuthError("Post deleted successfully!");
      setShowToast(true);
      handleCloseModal();
    } catch (err: unknown) {
      // Better to use unknown than any
      const error =
        err instanceof Error ? err : new Error("Upload operation failed");
      console.error("Upload error:", error);

      setAuthError(
        error.message.includes("credentials")
          ? "Authentication failed"
          : "Upload failed. Please try again."
      );
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const [q, setQ] = useState("");
  const searchFiltered =
    q === ""
      ? posts
      : posts.filter(
          (item: any) =>
            item?.name?.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
  console.log("list= ", posts);

  return (
    <DashboardLayout>
      <div className="flex flex-row items-center justify-between px-3 lg:px-5 lg:mt-5">
        <div className="btn-group" id="dropdown-icon-demo">
          <Link to={`${AppLinks.newPostLink}/${posts?.length + 1}`}>
            <button
              type="button"
              className="btn btn-dark"
              aria-expanded="false"
            >
              New Post
            </button>
          </Link>
        </div>

        <div
          id="nav-search-div"
          className="nav-item d-flex align-items-center py-1 w-lg-100 px-2 !rounded-full"
        >
          <i className="bx bx-search fs-4 lh-0"></i>
          <input
            id="nav-search"
            type="text"
            className="form-control pe-auto pe-lg-5 border-0 shadow-none"
            placeholder="Search..."
            aria-label="Search..."
            onChange={(e: any) => {
              if (e.target.value) {
                setQ(e.target.value);
              } else {
                setQ(e.target.value);
              }
            }}
          />
        </div>
      </div>

      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div id="dash-card" className="card text-white my-3">
            <div className="card-body">
              <div className="row gap-0 row-gap-3">
                <div className="col-lg-6 col-12 d-flex align-items-center justify-content-start flex-row px-auto">
                  <div className="row">
                    <div className="col-4">
                      <img
                        className="img-fluid me-2"
                        src="/img/new/person.svg"
                        alt="image"
                      />
                    </div>
                    <div className="col-8">
                      <p className="text-dark">User</p>
                      <h5 className="text-dark">
                        <b>{user?.firstName + " " + user?.lastName}</b>
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-12 px-5 d-flex align-items-center">
                  <div className="row">
                    <div className="col-12">
                      <p className="d-flex flex-md-row flex-column align-items-center justify-content-between mb-1 mt-1">
                        <span className="owner-field">User's Email:</span>
                      </p>
                    </div>

                    <hr className="card-line mx-auto" />

                    <div className="col-12">
                      <p className="d-flex flex-md-row flex-column justify-content-between align-items-center mb-1 mt-1">
                        <span className="owner-text text-dark">
                          <b>{user?.email}</b>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card mb-4">
                <div className="card-header bg-dark text-white d-flex flex-lg-row flex-column align-items-center justify-content-between">
                  <h5 className="my-auto text-white mb-3 mb-lg-0">Posts</h5>
                </div>
                <div className="table-responsive text-nowrap">
                  <table className="table">
                    <thead>
                      <tr className="dash-head">
                        <th>S/N</th>
                        <th colSpan={3}>Title</th>
                        <th className="text-center">Date</th>
                        <th className="text-center">Delete</th>
                      </tr>
                    </thead>

                    <tbody>
                      {posts && posts.length ? (
                        <>
                          {searchFiltered?.map((post, i) => (
                            <tr key={post?.id}>
                              <td>
                                <strong>{i + 1}</strong>
                              </td>

                              <td colSpan={3}>
                                <Link to={`${AppLinks.postPageLink}/${post?.id}`}>
                                  <strong>{post?.title}</strong>
                                </Link>
                              </td>

                              <td className="text-center">{new Date(post?.createdAt).toLocaleString()}</td>

                              <td>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  x="0px"
                                  y="0px"
                                  width="25"
                                  height="25"
                                  viewBox="0,0,256,256"
                                  className="cursor-pointer mx-auto"
                                  onClick={() => {
                                    setSelectedPost(post.id);
                                    setOpenModal(true);
                                  }}
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
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            <strong>No posts yet, add a post to begin!</strong>
                          </td>
                        </tr>
                      )}
                    </tbody>

                    <tfoot className="table-border-bottom-0 p-3">
                      <tr>
                        <th colSpan={5}>Total Posts</th>
                        <th className="text-end">{posts?.length}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-auth px-lg-5 px-3">
          <span>
            <p>&copy;Neureus Solutions 2023</p>
          </span>
          <span>
            <p className="flex flex-row items-center justify-start gap-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="48"
                viewBox="0 -960 960 960"
                width="48"
              >
                <path d="M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm340-302L140-685v465h680v-465L480-462Zm0-60 336-218H145l335 218ZM140-685v-55 520-465Z" />
              </svg>
              help@NeureusSolutions.com
            </p>
          </span>
        </div>

        <div className="content-backdrop fade"></div>
      </div>

      <Modal dismissible show={openModal} onClose={() => handleCloseModal()}>
        <ModalHeader className="p-4">Confirmation</ModalHeader>
        <ModalBody>
          <div className="w-full h-full flex flex-col items-stretch justify-start">
            <div className="w-full grow flex flex-col items-stretch justify-center">
              <div className="mb-1">
                <p className="!text-3xl text-center">Are you sure?</p>
              </div>

              <div className="flex flex-row justify-between gap-x-10">
                <button
                  disabled={loading}
                  type="button"
                  onClick={() => deletePost(selectedPost)}
                  className="form-btn btn btn-primary d-grid w-50 mx-auto"
                >
                  {loading ? (
                    /* From Uiverse.io by ashish-yadv */
                    <div className="loader">
                      <li className="ball"></li>
                      <li className="ball"></li>
                      <li className="ball"></li>
                    </div>
                  ) : (
                    "Yes"
                  )}
                </button>

                <button
                  disabled={loading}
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="form-btn btn btn-primary d-grid w-50 mx-auto"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {(showToast || authError) && (
        <Toast className="fixed top-2 right-2 px-3">
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

export default Dashboard;
