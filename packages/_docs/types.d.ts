declare module "*.svg" {
  import React, { ReactElement, SVGProps } from "react";
  const content: React.FC<SVGProps<SVGElement>>;
  export default content;
}
