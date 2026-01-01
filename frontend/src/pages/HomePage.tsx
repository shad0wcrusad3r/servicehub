import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Star, MapPin, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-6 border border-primary-200 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">India's Fastest Growing Service Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Connect with</span>
            <br />
            <span className="text-gray-900">Skilled Workers</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Find qualified professionals in <span className="font-semibold text-primary-600">Hubli</span> and <span className="font-semibold text-secondary-600">Dharwad</span>. 
            Post jobs, hire workers, and get your work done efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/signup/client"
              className="btn btn-primary btn-lg group"
            >
              <Briefcase className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Post a Job
            </Link>
            <Link
              to="/signup/labour"
              className="btn btn-secondary btn-lg group"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Find Work
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">1000+</div>
              <div className="text-sm text-gray-600">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-sm text-gray-600">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">95%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and efficient. Get started in minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Clients */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-primary-100">01</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Post Your Job</h3>
                <p className="text-gray-600 leading-relaxed">
                  Describe your work requirements, set your budget, and post your job.
                  Workers in your area will see it and apply.
                </p>
              </div>
            </div>

            {/* For Workers */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-success-400 to-success-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-success-100">02</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Find Work</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse available jobs in your category and location.
                  Apply for jobs that match your skills and schedule.
                </p>
              </div>
            </div>

            {/* Rating System */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-accent-100">03</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Build Reputation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Complete jobs successfully and get rated by clients.
                  Higher ratings lead to more work opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">ServiceHub</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make hiring skilled workers easier, faster, and more reliable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Verified Workers</h3>
              <p className="text-sm text-gray-600">All workers are verified and approved</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Best Rates</h3>
              <p className="text-sm text-gray-600">Competitive pricing with no hidden fees</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Quick Response</h3>
              <p className="text-sm text-gray-600">Get applications within hours</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Rated Service</h3>
              <p className="text-sm text-gray-600">Review-based quality assurance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Service <span className="gradient-text">Areas</span>
          </h2>
          <p className="text-lg text-gray-600 mb-12">Connecting workers and clients across twin cities</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-4 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900 relative z-10">Hubli</h3>
              <p className="text-gray-600 relative z-10 leading-relaxed">
                Find skilled workers across all areas of Hubli for your home and office needs.
              </p>
            </div>
            
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <MapPin className="w-16 h-16 text-secondary-600 mx-auto mb-4 relative z-10" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900 relative z-10">Dharwad</h3>
              <p className="text-gray-600 relative z-10 leading-relaxed">
                Connect with experienced labourers in Dharwad for reliable service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular <span className="gradient-text">Categories</span>
            </h2>
            <p className="text-lg text-gray-600">Find skilled professionals for every need</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Plumbing', gradient: 'from-blue-400 to-blue-600' },
              { name: 'Electrical', gradient: 'from-yellow-400 to-yellow-600' },
              { name: 'Carpentry', gradient: 'from-amber-400 to-amber-600' }, 
              { name: 'Painting', gradient: 'from-pink-400 to-pink-600' },
              { name: 'Cleaning', gradient: 'from-green-400 to-green-600' },
              { name: 'Gardening', gradient: 'from-emerald-400 to-emerald-600' },
              { name: 'Construction', gradient: 'from-orange-400 to-orange-600' },
              { name: 'Repair', gradient: 'from-purple-400 to-purple-600' }
            ].map((category) => (
              <div
                key={category.name}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 border border-gray-100 text-center cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <span className="relative font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ready to Get <span className="gradient-text">Started?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of clients and workers who trust our platform
            for their work needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="btn btn-primary btn-lg"
            >
              Sign In Now
            </Link>
            <Link
              to="/signup/client"
              className="btn btn-outline btn-lg"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;