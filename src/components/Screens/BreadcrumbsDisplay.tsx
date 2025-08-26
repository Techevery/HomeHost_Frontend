import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import back from "../../assets/navigateback.svg";
import { Breadcrumbs, Link } from '@material-ui/core';
import { capitalizeFirstLetter } from './Dashboard';
import { IoCaretBackCircle, IoChevronBackCircle } from "react-icons/io5";

const BreadcrumbsDisplay = () => {

    const url = useLocation();
    const navigate = useNavigate();
  
    const { pathname } = url;
    const pathnames = pathname
      .split("/")
      .filter((x) => x)
      .filter((x) => x !== "dashboard");
  
  return (
    <div className="py-6  pl-[2%]  flex items-center gap-6">
    <div
      onClick={() => navigate(-1)}
      className=" cursor-pointer"
    >
    <IoChevronBackCircle className='w-10 h-10'/>
    </div>
    {!pathname.includes("/dashboard/cards/") &&
      !pathname.includes("/dashboard/invoice/edit") && (
        <Breadcrumbs aria-label="breadcrumb" separator="›">
          {pathnames.map((name, index) => {
            //to join the array items into one path
            const pathTo = `/dashboard/${pathnames
              .slice(0, index + 1)
              .join("/")}`;

            const isLast = index === pathnames.length - 1;

            if (index === 0 || index === 1) {
              if (index === 1 && isLast) {
                return (
                  <h1
                    className="text-primary text-base leading-4 font-light "
                    key={index}
                  >
                    {name.includes("%20")
                      ? capitalizeFirstLetter(
                          name
                            .split("%20")
                            .slice(0, index + 1)
                            .join(" ")
                        )
                      : capitalizeFirstLetter(name)}
                  </h1>
                );
              } else {
                return (
                  <Link
                    key={index}
                    underline="hover"
                    className="font-light text-base leading-4 text-[#958F8F] "
                    color="initial"
                    onClick={() => navigate(pathTo)}
                  >
                    {name.includes("%20")
                      ? capitalizeFirstLetter(
                          name
                            .split("%20")
                            .slice(0, index + 1)
                            .join(" ")
                        )
                      : capitalizeFirstLetter(name)}
                  </Link>
                );
              }
            } else if (isLast && index !== 1) {
              return (
                <h1
                  key={index}
                  className="text-primary text-base leading-4 font-light "
                >
                  {name.includes("%20")
                    ? capitalizeFirstLetter(
                        name
                          .split("%20")
                          .slice(0, index + 1)
                          .join(" ")
                      )
                    : capitalizeFirstLetter(name)}
                </h1>
              );
            }
          })}
        </Breadcrumbs>
      )}
  </div>
  )
}

export default BreadcrumbsDisplay