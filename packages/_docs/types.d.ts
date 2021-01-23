declare module "*.svg" {
  import React, { SVGProps } from "react";
  const content: React.FC<SVGProps<SVGElement>>;
  export default content;
}
