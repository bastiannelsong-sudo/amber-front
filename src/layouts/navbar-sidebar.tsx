import { Footer } from "flowbite-react";
import type { FC, PropsWithChildren } from "react";
import Navbar from "../components/navbar";
import { MdFacebook } from "react-icons/md";
import { FaDribbble, FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: FC<PropsWithChildren<NavbarSidebarLayoutProps>> =
  function ({ children, isFooter = true }) {
    return (
      <>
        <Navbar />
        <div className="flex items-start pt-16">
          <MainContent isFooter={isFooter}>{children}</MainContent>
        </div>
      </>
    );
  };

const MainContent: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({
  children,
  isFooter,
}) {
  return (
    <main className="relative h-full w-full overflow-y-auto bg-gray-50">
      {children}
      {isFooter && (
        <div className="mx-4 mt-4">
          <MainContentFooter />
        </div>
      )}
    </main>
  );
};

const MainContentFooter: FC = function () {
  return (
    <>
      <Footer container>
        <div className="flex w-full flex-col gap-y-6 lg:flex-row lg:justify-between lg:gap-y-0">
          <Footer.LinkGroup>
            <Footer.Link href="#" className="mb-3 mr-3 lg:mb-0">
              Términos y condiciones
            </Footer.Link>
            <Footer.Link href="#" className="mb-3 mr-3 lg:mb-0">
              Política de privacidad
            </Footer.Link>
            <Footer.Link href="#" className="mr-3">
              Licencia
            </Footer.Link>
            <Footer.Link href="#" className="mr-3">
              Política de cookies
            </Footer.Link>
            <Footer.Link href="#">Contacto</Footer.Link>
          </Footer.LinkGroup>
          <Footer.LinkGroup>
            <div className="flex gap-4 md:gap-0">
              <Footer.Link href="#" className="hover:[&>*]:text-black">
                <MdFacebook className="text-lg" />
              </Footer.Link>
              <Footer.Link href="#" className="hover:[&>*]:text-black">
                <FaInstagram className="text-lg" />
              </Footer.Link>
              <Footer.Link href="#" className="hover:[&>*]:text-black">
                <FaTwitter className="text-lg" />
              </Footer.Link>
              <Footer.Link href="#" className="hover:[&>*]:text-black">
                <FaGithub className="text-lg" />
              </Footer.Link>
              <Footer.Link href="#" className="hover:[&>*]:text-black">
                <FaDribbble className="text-lg" />
              </Footer.Link>
            </div>
          </Footer.LinkGroup>
        </div>
      </Footer>
      <p className="my-8 text-center text-sm text-gray-500">
        &copy; 2025 Amber. Todos los derechos reservados.
      </p>
    </>
  );
};

export default NavbarSidebarLayout;
