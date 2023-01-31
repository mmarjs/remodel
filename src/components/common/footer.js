import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5 text-center">
      <div className="container py-3 my-3">
        <h3 className="fw-semibold mb-0">Touchupp</h3>

        <div className="footer-link">
          <ul className="list-unstyled list-inline my-5">
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to=""
                className="font-nunito text-white text-decoration-none"
              >
                Home
              </Link>
            </li>
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to=""
                className="font-nunito text-white text-decoration-none"
              >
                Pricing
              </Link>
            </li>
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to="about"
                className="font-nunito text-white text-decoration-none"
              >
                About us
              </Link>
            </li>
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to="contact"
                className="font-nunito text-white text-decoration-none"
              >
                Contact
              </Link>
            </li>
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to=""
                className="font-nunito text-white text-decoration-none"
              >
                Privacy
              </Link>
            </li>
            <li className="list-inline-item mx-2 mx-lg-4 mb-2">
              <Link
                to=""
                className="font-nunito text-white text-decoration-none"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
        <p>© 2022-2023, All Rights Reserved</p>
      </div>
    </footer>
  );
}
