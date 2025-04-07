import { Link, useNavigate } from "react-router";
import { useState } from "react";
import "./assets/page-auth.css";
import { USER_EMAIL, USER_NAME } from "../../redux/urls";
import { useAppDispatch } from "../../redux/hooks";
import { updateUser } from "./_redux/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Toast, ToastToggle } from "flowbite-react";
import { getJsonFileFromS3 } from "../../utils/helper";

interface GoogleJwtPayload extends JwtPayload {
  googleId: string;
  email: string;
  given_name: string;
  family_name: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const loginUser = (items: any) => {
    setLoading(true);

    if (items.email !== USER_EMAIL && items.firstName !== USER_NAME) {
      setAuthError(`Invalid credentials`);
      setShowToast(true);
      return;
    }

    try {
      console.log("items");

      dispatch(
        updateUser({
          user: {
            firstName: items.firstName,
            lastName: items.lastName,
            email: items.email,
          },
          token: items.googleId,
        })
      );
      getJsonFileFromS3();

      navigate("/");
    } catch (err) {
      setAuthError(`Something went wrong! Error: ${err}`);
      setShowToast(true);
    }

    setLoading(false);
  };

  return (
    <div className="container-xxl auth-container">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="app-brand">
          <Link to="/" className="app-brand-link gap-2">
            <span className="app-brand-logo demo">
              <h3 className="logo-h3">
                Yonko
                <br />
                Solutions
              </h3>
            </span>
          </Link>
        </div>

        <div className="authentication-inner">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="mb-2">Welcome Back!</h2>
              <p className="mb-4 card-p small">
                Log into your Yonko Solutions account
              </p>

              {loading && (
                <div className="w-full flex flex-col items-center justify-center mt-3">
                  <p className="text-white text-5xl font-semibold">
                    Loading...
                  </p>
                </div>
              )}

              <div className="w-full flex flex-col items-center justify-center mt-3">
                <GoogleLogin
                  onSuccess={(credentialResponse: any) => {
                    const userInfo = jwtDecode<GoogleJwtPayload>(
                      credentialResponse.credential
                    );

                    console.log("first=== ", userInfo);

                    setLoading(true);

                    loginUser({
                      googleId: userInfo.sub,
                      firstName: userInfo.given_name,
                      lastName: userInfo.family_name,
                      email: userInfo.email,
                    });
                  }}
                  onError={() => {
                    setAuthError("Login Failed");
                    setShowToast(true);
                  }}
                />
              </div>

              <div className="text-center mt-3">
                <p className="text-center text-sm mb-0">
                  <span>Don't have an account? </span>
                </p>

                <p className="text-center text-sm mb-0">
                  <Link to="#">
                    <span>Reach out to Yonko to get your own account!</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-auth px-3">
          <span>
            <p>&copy;Yonko Solutions 2025</p>
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
              nonso.udonne@gmail.com
            </p>
          </span>
        </div>
      </div>

      <div className="login-img">
        <img src="/img/new/image4.png" alt="" />
      </div>

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
    </div>
  );
};

export default Login;
