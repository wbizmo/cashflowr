import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AnalyticsSection from "../components/landing/AnalyticsSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FAQSection from "../components/landing/FAQSection";
import ContactSection from "../components/landing/ContactSection";
import BackToTop from "../components/landing/BackToTop";
import Footer from "../components/landing/Footer";

const Landing = () => {
  return (
    <div id="top" className="min-h-screen bg-[#070B14] text-white">
      <LandingNavbar />
      <HeroSection />
      <AnalyticsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Landing;