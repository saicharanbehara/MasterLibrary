import React, { useState, useEffect } from "react";

const CategoryCheckboxes = ({ selected, onToggle }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!categories.length) return <p>No categories available.</p>;

  return (
    <div>
      {categories.map(({ categoryID, categoryName, status }) => (
        <label key={categoryID} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={selected.includes(categoryID)}
            onChange={() => onToggle(categoryID)}
          />{" "}
          {categoryName} ({status})
        </label>
      ))}
    </div>
  );
};

export default CategoryCheckboxes;
