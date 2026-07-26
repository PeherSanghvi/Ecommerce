import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import api from '../api';

const CategoryHierarchy = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const currentDepartment = searchParams.get('department') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/hierarchy');
      if (response.data?.success) {
        const cats = response.data.data || [];
        setCategories(cats);
        console.log('Loaded categories:', cats);
        
        // Auto-expand current category
        if (currentDepartment) {
          setExpandedCategory(currentDepartment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllProducts = () => {
    setSearchParams(new URLSearchParams([['page', '1']]));
    setExpandedCategory(null);
  };

  const handleCategoryClick = (departmentName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('department', departmentName);
    newParams.delete('subcategory');
    newParams.set('page', '1');
    setSearchParams(newParams);
    setExpandedCategory(departmentName);
  };

  const handleSubcategoryClick = (departmentName, subcatName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('department', departmentName);
    newParams.set('subcategory', subcatName);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleCategory = (categoryName, e) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const isSubcategoryActive = (subCat) => {
    return currentSubcategory === subCat;
  };

  const isCategoryActive = (catName) => {
    return currentDepartment === catName;
  };

  const isAllActive = !currentDepartment && !currentSubcategory;

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 overflow-y-auto z-40 lg:relative lg:fixed-none lg:h-auto lg:border-r lg:w-full"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between lg:hidden">
        <h2 className="font-bold text-lg text-black">Categories</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Categories List */}
      <div className="p-4 lg:p-6 space-y-1">
        {/* All Products Button */}
        <motion.button
          onClick={handleAllProducts}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
            isAllActive
              ? 'bg-black text-white font-bold'
              : 'text-gray-700 hover:bg-gray-100 font-semibold'
          }`}
        >
          <span>All Products</span>
        </motion.button>

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No categories available</p>
        ) : (
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div key={category.name} layout>
                {/* Primary Category */}
                <motion.button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    isCategoryActive(category.name)
                      ? 'bg-black text-white font-bold'
                      : 'text-gray-700 hover:bg-gray-100 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-2 flex-1">
                    <span>{category.name}</span>
                    <span className="text-xs opacity-70">({category.productCount})</span>
                  </span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <motion.button
                      onClick={(e) => toggleCategory(category.name, e)}
                      className={`p-1 rounded transition-transform ${
                        isCategoryActive(category.name)
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      <motion.div
                        animate={{
                          rotate: expandedCategory === category.name ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  )}
                </motion.button>

                {/* Subcategories */}
                <AnimatePresence>
                  {expandedCategory === category.name && category.subcategories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-1 mt-1">
                        {category.subcategories.map((subCat) => (
                          <motion.button
                            key={subCat}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            onClick={() => handleSubcategoryClick(category.name, subCat)}
                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                              isSubcategoryActive(subCat)
                                ? 'bg-black text-white font-bold'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <ChevronRight className="w-3 h-3" />
                            <span>{subCat}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Clear Filters Button */}
      {(currentDepartment || currentSubcategory) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-200 p-4 lg:p-6"
        >
          <button
            onClick={handleAllProducts}
            className="w-full py-2 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CategoryHierarchy;
