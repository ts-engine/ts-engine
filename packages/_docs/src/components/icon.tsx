import React from "react";
import { IconType } from "react-icons";

interface IconProps {
  icon: IconType;
  label: string;
  className?: string;
}

export const Icon = (props: IconProps) => {
  return React.createElement(props.icon, {
    "aria-label": props.label,
    className: props.className,
  });
};
