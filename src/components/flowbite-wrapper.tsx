import { Flowbite } from "flowbite-react";
import type { FC } from "react";
import { Outlet } from "react-router";
import theme from "../flowbite-theme";

const FlowbiteWrapper: FC = function () {
  return (
    <Flowbite theme={{ theme }}>
      <Outlet />
    </Flowbite>
  );
};

export default FlowbiteWrapper;
