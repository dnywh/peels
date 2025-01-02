function CheckboxUnit({ id, checked, onChange, required = false, children }) {
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required={required}
      />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}

export default CheckboxUnit;
