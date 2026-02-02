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

  const initialKey = useMemo(() => {
    try {
      return JSON.stringify(initialData || {});
    } catch {
      return String(Date.now());
    }
  }, [initialData]);

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

  // Slightly more mobile-friendly height/padding
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
      cols = 1, // 1 or 2
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

  // ✅ Width/height rules handled inside Modal usually.
  // But we can still ensure the form area scrolls on small screens.
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* ✅ Scroll inside modal content if needed */}
        <div className="max-h-[70vh] overflow-y-auto pr-1 sm:pr-2">
          {/* ✅ Responsive grid: 1 col on mobile, 2 cols on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => renderField(field))}
          </div>
        </div>

        {/* ✅ Buttons stack on tiny screens, inline on sm+ */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="w-full sm:w-auto"
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;
