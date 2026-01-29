import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "md",
}) => {
  const [formData, setFormData] = useState({});

  // Create a stable "signature" for initialData (so we can detect changes safely)
  const initialKey = useMemo(() => {
    try {
      return JSON.stringify(initialData || {});
    } catch {
      return String(Date.now());
    }
  }, [initialData]);

  // ✅ Reset ONLY when modal opens.
  // If you switch selectedUser while modal is open, it should load that user too.
  useEffect(() => {
    if (!isOpen) return;
    setFormData(initialData || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialKey]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  if (!isOpen) return null;

  // ---------- Tailwind styles (light + dark) ----------
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";
  const helpCls = "text-xs text-gray-500 dark:text-gray-400 mt-1";
  const inputCls =
    "w-full h-11 rounded-xl px-3 text-sm outline-none " +
    "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 " +
    "border border-transparent dark:border-gray-700 " +
    "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";

  const textareaCls =
    "w-full rounded-xl px-3 py-2.5 text-sm outline-none min-h-[110px] resize-none " +
    "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 " +
    "border border-transparent dark:border-gray-700 " +
    "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
    "focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";

  const selectCls = inputCls + " pr-10";

  const checkboxCls =
    "h-4 w-4 rounded border-gray-300 dark:border-gray-700 " +
    "text-blue-600 focus:ring-blue-500 dark:bg-gray-900";

  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      placeholder,
      required = false,
      options = [],
      description,
      cols = 1, // optional: 1 or 2
    } = field;

    const wrapperCls = cols === 2 ? "md:col-span-2" : "";

    if (type === "checkbox") {
      return (
        <div key={name} className={`flex items-center gap-2 ${wrapperCls}`}>
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={!!formData[name]}
            onChange={handleChange}
            className={checkboxCls}
          />
          <label htmlFor={name} className="text-sm text-gray-700 dark:text-gray-200">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div key={name} className={wrapperCls}>
          <label htmlFor={name} className={labelCls}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={name}
            name={name}
            value={formData[name] ?? ""}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            rows={4}
            className={textareaCls}
          />
          {description ? <p className={helpCls}>{description}</p> : null}
        </div>
      );
    }

    if (type === "select") {
      return (
        <div key={name} className={wrapperCls}>
          <label htmlFor={name} className={labelCls}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={name}
            name={name}
            value={formData[name] ?? ""}
            onChange={handleChange}
            required={required}
            className={selectCls}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {description ? <p className={helpCls}>{description}</p> : null}
        </div>
      );
    }

    return (
      <div key={name} className={wrapperCls}>
        <label htmlFor={name} className={labelCls}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={inputCls}
        />
        {description ? <p className={helpCls}>{description}</p> : null}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* optional grid for nicer layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => renderField(field))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button type="submit" variant="primary" disabled={loading} loading={loading}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;
