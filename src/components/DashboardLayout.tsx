import { Link } from "react-router";
import { logoutUser } from "../pages/Auth/_redux/userSlice";
import { useAppDispatch } from "../redux/hooks";
// import { AppLinks } from "../utils/Routes";
import { useRef } from "react";

const DashboardLayout = ({ children }: any) => {
  const dispatch = useAppDispatch();
  const toggleMenu = useRef<any>(null);

  const menuToggler = () => {
    let toggler = toggleMenu.current.closest("html").classList;

    if (toggler.contains("layout-menu-expanded")) {
      toggler.add("layout-transitioning");
      toggler.remove("layout-menu-expanded");
      setTimeout(() => toggler.remove("layout-transitioning"), 1000);
    } else {
      toggler.add("layout-transitioning");
      toggler.add("layout-menu-expanded");
      setTimeout(() => toggler.remove("layout-transitioning"), 1000);
    }
  };

  return (
    <div className="relative layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <aside
          id="layout-menu"
          className="layout-menu menu-vertical menu bg-menu-theme"
        >
          <div className="aside-inner">
            <div className="app-brand demo mt-lg-5 mb-lg-3">
              <Link to="/" className="app-brand-link">
                <span className="app-brand-logo demo">
                  {/* <img src="/img/new/image3.png" alt="image"/> */}
                  <h3 className="logo-dash">
                    Neureus
                    <br />
                    Solutions
                  </h3>
                </span>
              </Link>

              <span
                className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
                onClick={menuToggler}
              >
                <i className="bx bx-chevron-left bx-sm align-middle"></i>
              </span>
            </div>

            <div className="menu-inner-shadow"></div>

            <ul className="menu-inner py-1">
              <li className="menu-item active">
                <Link to="/" className="menu-link">
                  <i className="menu-icon tf-icons bx bx-home-circle"></i>
                  <div data-i18n="Analytics">Dashboard</div>
                </Link>
              </li>

              {/* <li className="menu-item">
                <Link to={AppLinks.settingsLink} className="menu-link">
                  <img
                    className="menu-icon tf-icons"
                    src="/img/new/person.svg"
                    alt="image"
                  />
                  <div data-i18n="Analytics">Settings</div>
                </Link>
              </li> */}

              <li className="menu-item">
                <span
                  onClick={() => dispatch(logoutUser())}
                  className="menu-link cursor-pointer"
                >
                  <img
                    className="menu-icon tf-icons"
                    src="/img/icons/logout.svg"
                    alt="image"
                  />
                  <div data-i18n="Analytics">Logout</div>
                </span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="layout-page">
          <div className="w-full flex lg:hidden flex-row items-center justify-between p-3">
            <Link to="/" className="app-brand-link">
              <span className="app-brand-logo demo">
                <h5 className="!text-[#233446] !font-bold">
                  Neureus
                  <br />
                  Solutions
                </h5>
              </span>
            </Link>

            <div
              className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none"
              ref={toggleMenu}
              onClick={menuToggler}
            >
              <span className="nav-item nav-link px-0 me-xl-4">
                <i className="bx bx-menu bx-sm !text-4xl"></i>
              </span>
            </div>
          </div>

          {children}
        </div>
      </div>

      <div
        className="layout-overlay layout-menu-toggle"
        onClick={menuToggler}
      ></div>
    </div>
  );
};

export default DashboardLayout;
