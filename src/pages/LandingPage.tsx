import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QRCodeDisplay from '@/components/shared/QRCodeDisplay';
import { 
  Dumbbell, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  QrCode,
  Smartphone,
  Calendar
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tristar-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TriStar Fitness
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
                  Fitness & Wellness
                </p>
              </div>
            </div>
            <Link to="/admin-login">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tristar-600 to-green-600">
                TriStar Fitness
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Your premier destination for fitness and wellness. Join our community and start your journey to a healthier lifestyle.
            </p>
          </div>

          {/* QR Code Section */}
          <Card className="max-w-md mx-auto mb-12 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Quick Registration</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Scan the QR code to register as a visitor
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <QRCodeDisplay url={`${window.location.origin}/visitor-register`} size={200} />
              </div>
              <Link to="/visitor-register">
                <Button className="w-full bg-tristar-600 hover:bg-tristar-700 text-white">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Register as Visitor
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-tristar-100 dark:bg-tristar-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-tristar-600 dark:text-tristar-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Expert Trainers
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Work with certified professionals who will guide you to your fitness goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-tristar-100 dark:bg-tristar-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-tristar-600 dark:text-tristar-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Flexible Hours
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Open to fit your busy schedule. Work out whenever it's convenient for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-tristar-100 dark:bg-tristar-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-tristar-600 dark:text-tristar-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Modern Equipment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  State-of-the-art fitness equipment to help you achieve your best results.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join thousands of members who have transformed their lives with TriStar Fitness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/visitor-register">
                <Button size="lg" className="bg-tristar-600 hover:bg-tristar-700 text-white">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book a Visit
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button size="lg" variant="outline">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Member Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-tristar-500 to-tristar-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">TriStar Fitness</span>
          </div>
          <p className="text-gray-400">
            © 2025 TriStar Fitness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
