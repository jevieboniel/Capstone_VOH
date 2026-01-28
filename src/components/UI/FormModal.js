import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  size = 'md'
}) => {
  const [formData, setFormData] = useState({});

  // Only reset when modal opens
  useEffect(() => {
  setFormData(initialData || {});
}, [initialData]);
 // Simplified dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field) => {
    const { name, label, type = 'text', placeholder, required = false, options = [] } = field;
    
    if (type === 'textarea') {
      return (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            rows={4}
            className="input-field"
          />
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={name}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            required={required}
            className="input-field"
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'checkbox') {
      return (
        <div key={name} className="flex items-center">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={formData[name] || false}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
            {label}
          </label>
        </div>
      );
    }

    return (
      <div key={name}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="input-field"
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => renderField(field))}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;
