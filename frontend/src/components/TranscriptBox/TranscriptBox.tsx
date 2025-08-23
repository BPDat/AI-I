import React from "react";
import classNames from "classnames/bind";
import classes from "./TranscriptBox.module.scss";

const cx = classNames.bind(classes);

type Props = {
  partial: string;
  finals: string[];
};

export default function TranscriptBox({ partial, finals }: Props) {
  return (
    <div className={cx("wrap")}>
      {finals.map((t, i) => (
        <div key={i} className={cx("final")}>
          • {t}
        </div>
      ))}
      {partial && <div className={cx("partial")}>{partial}</div>}
      {!partial && finals.length === 0 && (
        <div className={cx("partial")}>Nói điều gì đó…</div>
      )}
    </div>
  );
}
