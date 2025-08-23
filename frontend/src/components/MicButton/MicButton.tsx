import React from "react";
import classNames from "classnames/bind";
import classes from "./MicButton.module.scss";

const cx = classNames.bind(classes);

type Props = {
  recording: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export default function MicButton({ recording, disabled, onToggle }: Props) {
  return (
    <button
      className={cx("root", {
        recording,
        idle: !recording,
        disabled,
      })}
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={recording}
    >
      <span className={cx("dot")} aria-hidden />
      <span className={cx("label")}>
        {recording ? "Đang ghi..." : "Bật mic"}
      </span>
    </button>
  );
}
