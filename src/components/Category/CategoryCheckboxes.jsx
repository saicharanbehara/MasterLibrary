import React, { useState, useEffect, useRef } from "react";
import "../Category/CategoryCheckboxes.css"; // You'll need to create this file

const CategoryCheckboxes = ({ selected, onToggle }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://localhost:7270/api/Master/Category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Flag: "VIEW" }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.category_Variables && data.category_Variables.length > 0) {
          setCategories(data.category_Variables);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const getSelectedNames = () => {
    const names = categories
      .filter((c) => selected.includes(c.categoryID))
      .map((c) => c.categoryName);
    return names.length > 0 ? names.join(", ") : "Select Categories";
  };

  return (
    <div className="category-dropdown-container" ref={dropdownRef}>
      <div className="category-dropdown-header" onClick={toggleDropdown}>
        {getSelectedNames()}
        <span className="category-dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="category-dropdown-list">
          {loading && <p className="category-loading">Loading...</p>}
          {error && <p className="category-error">Error: {error}</p>}
          {!loading && !error && categories.length === 0 && (
            <p className="category-empty">No categories available.</p>
          )}

          {!loading &&
            !error &&
            categories.map(({ categoryID, categoryName, status }) => (
              <label key={categoryID} className="category-checkbox-item">
                <input
                  type="checkbox"
                  checked={selected.includes(categoryID)}
                  onChange={() => onToggle(categoryID)}
                />
                {categoryName} ({status})
              </label>
            ))}
        </div>
      )}
    </div>
  );
};

export default CategoryCheckboxes;
