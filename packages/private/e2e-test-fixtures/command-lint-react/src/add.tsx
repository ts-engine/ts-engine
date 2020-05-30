import React from "react";

interface AddProps {
  a: number;
  b: number;
}

export const Add = (props: AddProps) => {
  return <span>{props.a + props.b}</span>;
};
