import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Truck, Clock } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { page: 1, limit: 8 } });
      setProducts(response.data.data || response.data.products || response.data);
    } catch (error) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600', link: '/products?department=Fashion' },
    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600', link: '/products?department=Electronics' },
    { name: 'Home & Garden', img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600', link: '/products?department=Home%20%26%20Garden' },
    { name: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600', link: '/products?department=Beauty' }
  ];

  const features = [
    { icon: <Truck className="w-8 h-8 text-indigo-500" />, title: 'Free Global Shipping', desc: 'On all orders over $200. Fast & reliable.' },
    { icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />, title: 'Secure Checkout', desc: '256-bit encryption for your peace of mind.' },
    { icon: <Star className="w-8 h-8 text-indigo-500" />, title: 'Premium Quality', desc: 'Curated products from top tier brands.' },
    { icon: <Clock className="w-8 h-8 text-indigo-500" />, title: '24/7 Support', desc: 'Our dedicated team is always here to help.' },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-base)' }}>
      
      {/* Hero Section - Simplified, no purple/pink gradient */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--text-primary)' }}>
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" className="w-full h-full object-cover opacity-40" alt="AURA Hero" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--text-primary), transparent)' }}></div>
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6"
          >
            Premium Products for Modern Living
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 mb-10 font-light max-w-2xl mx-auto"
          >
            Discover curated collections designed for quality and sustainability.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="inline-flex items-center justify-center px-10 py-4 text-white font-bold text-sm tracking-widest uppercase rounded-full transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: 'var(--accent-cta)' }}>
              Shop Now <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/admin/login" className="inline-flex items-center justify-center px-10 py-4 text-gray-900 font-bold text-sm tracking-widest uppercase rounded-full transition-transform hover:scale-105 active:scale-95 bg-gray-100 hover:bg-gray-200">
              Admin Portal <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="container-storefront">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((cat, idx) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: idx * 0.1 }} viewport={{ once: true, margin: "-100px" }}
              >
                <Link to={cat.link} className="group block relative h-[300px] rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,29,35,0.8), transparent)' }}></div>
                  <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-between">
                    <span className="text-white font-bold text-xl tracking-tight">{cat.name}</span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ backgroundColor: 'var(--accent-primary)' }}>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* Trending Products */}
      <div className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="container-storefront">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ color: 'var(--text-primary)' }}>Trending Products</h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-base">The most coveted items in our collection.</p>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm group" style={{ color: 'var(--accent-primary)' }}>
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid-products">
            {loading ? (
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            ) : (
              products.map((product, idx) => (
                <motion.div key={product._id || product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true, margin: "-50px" }}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trust & Benefits Features */}
      <div className="py-20 border-t" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
        <div className="container-storefront">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--accent-primary)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
