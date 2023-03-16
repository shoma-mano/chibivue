export function patchDOMProp(el: any, key: string, value: any) {
  if (key === "value") {
    // store value as _value as well since
    // non-string values will be stringified.
    el._value = value;
    const newValue = value == null ? "" : value;
    if (el.value !== newValue) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    return;
  }

  if (value === "" || value == null) {
    el[key] = value;
  }
}
