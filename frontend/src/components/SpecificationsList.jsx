import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const SpecificationsList = ({ specifications, description, product }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Parse specifications from product data
  const parsedSpecs = useMemo(() => {
    const specs = {};

    // Try to parse from specifications field
    if (specifications) {
      try {
        const parsed = typeof specifications === 'string' 
          ? JSON.parse(specifications.replace(/'/g, '"'))
          : specifications;

        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (typeof item === 'object') {
              Object.entries(item).forEach(([key, value]) => {
                if (!specs[key]) specs[key] = [];
                specs[key].push(value);
              });
            }
          });
        } else if (typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            specs[key] = Array.isArray(value) ? value : [value];
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Try to parse from description field
    if (description && Object.keys(specs).length === 0) {
      try {
        const parsed = typeof description === 'string'
          ? JSON.parse(description.replace(/'/g, '"'))
          : description;

        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (typeof item === 'object') {
              Object.entries(item).forEach(([key, value]) => {
                if (!specs[key]) specs[key] = [];
                specs[key].push(value);
              });
            }
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    return specs;
  }, [specifications, description]);

  // Generate default specifications if none found
  const defaultSpecs = useMemo(() => {
    return {
      'General': [
        'Premium quality materials',
        'Modern design and finish',
        'Durable construction',
        'Eco-friendly packaging',
      ],
      'Features': [
        'High performance',
        'Easy to use',
        'Compact and portable',
        'User-friendly interface',
      ],
      'Warranty': [
        '1-year manufacturer warranty',
        '24/7 customer support',
        '30-day money-back guarantee',
        'Free technical support',
      ],
    };
  }, []);

  const displaySpecs = Object.keys(parsedSpecs).length > 0 ? parsedSpecs : defaultSpecs;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Open first section by default
  React.useEffect(() => {
    const firstSection = Object.keys(displaySpecs)[0];
    if (firstSection && !expandedSections[firstSection]) {
      setExpandedSections((prev) => ({
        ...prev,
        [firstSection]: true,
      }));
    }
  }, [displaySpecs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {Object.entries(displaySpecs).map(([section, items]) => (
        <motion.div
          key={section}
          variants={itemVariants}
          className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
        >
          {/* Section Header */}
          <motion.button
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
            onClick={() => toggleSection(section)}
            className="w-full px-6 py-4 flex items-center justify-between font-bold text-left transition-colors"
          >
            <span className="text-gray-900 text-base uppercase tracking-wide">{section}</span>
            <motion.div
              animate={{ rotate: expandedSections[section] ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          </motion.button>

          {/* Section Content */}
          <motion.div
            initial={false}
            animate={{
              height: expandedSections[section] ? 'auto' : 0,
              opacity: expandedSections[section] ? 1 : 0,
            }}
            transition={{
              height: { duration: 0.3, ease: 'easeInOut' },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden border-t border-gray-200"
          >
            <motion.div
              className="px-6 py-4 space-y-3 bg-gray-50"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Array.isArray(items) && items.length > 0 ? (
                items.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {typeof item === 'object' ? JSON.stringify(item) : item}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  {typeof items === 'object' ? JSON.stringify(items) : items}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}

      {/* Additional Information Section */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8"
      >
        <h3 className="font-bold text-gray-900 mb-4 text-base uppercase tracking-wide">
          Additional Information
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>All products come with manufacturer warranty and customer support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Free shipping on orders over ₹500 across India</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>30-day easy returns and exchanges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span>Contact our support team for any queries</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default SpecificationsList;
