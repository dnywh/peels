import React from "react";
import * as Switch from "@radix-ui/react-switch";

import styles from "./SwitchToggle.module.css";

function SwitchToggle({ id, label, checked, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <label className="Label" htmlFor={id} style={{ paddingRight: 15 }}>
        {label}
      </label>
      <Switch.Root
        className={styles.SwitchRoot}
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      >
        <Switch.Thumb className={styles.SwitchThumb} />
      </Switch.Root>
    </div>
  );
}

export default SwitchToggle;
