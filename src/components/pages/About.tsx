import React from 'react';
  import { Link, useNavigate } from 'react-router-dom';

  const AboutUs: React.FC = () => {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col md:flex-row h-screen">
        <div
          className="md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bg.svg')" }}
        />
        <div className="md:w-1/2 p-8 overflow-y-auto bg-white">
          <img
            src="/images/logo2.svg"
            alt="Company Logo"
            className="block mx-auto mb-8 cursor-pointer"
            style={{ maxWidth: '150px' }}
            onClick={() => navigate('/')}
          />
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Homey Host</h2>
            <p>
              At Homey Host, we are dedicated to providing exceptional real estate services that exceed our clients' expectations. With years of experience in the industry, our team of professionals is committed to helping you find the perfect property or sell your current home with ease and confidence.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
            <p>
              Our mission is to deliver unparalleled real estate services by combining our extensive market knowledge, innovative strategies, and a client-focused approach. We strive to build lasting relationships with our clients by understanding their unique needs and providing personalized solutions.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Values</h2>
            <ul className="list-disc pl-5">
              <li><strong>Integrity</strong>: We uphold the highest standards of integrity in all our actions.</li>
              <li><strong>Excellence</strong>: We are committed to delivering excellence in every aspect of our business.</li>
              <li><strong>Innovation</strong>: We embrace change and continuously seek new ways to improve our services.</li>
              <li><strong>Customer Focus</strong>: Our clients are at the heart of everything we do, and we are dedicated to meeting their needs.</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Services</h2>
            <ul className="list-disc pl-5">
              <li><strong>Residential Sales and Leasing</strong>: Whether you're buying, selling, or leasing, our team is here to guide you through the process with expert advice and support.</li>
              <li><strong>Commercial Real Estate</strong>: We offer comprehensive services for commercial property transactions, including sales, leasing, and property management.</li>
              <li><strong>Property Management</strong>: Our property management services ensure your investment is well-maintained and profitable.</li>
              <li><strong>Real Estate Investment</strong>: We provide strategic investment advice to help you maximize your returns in the real estate market.</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
            <p>
              Our team of experienced real estate professionals is passionate about helping you achieve your real estate goals. We pride ourselves on our deep understanding of the market and our ability to deliver results that exceed expectations.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p>
              We would love to hear from you! Whether you're looking to buy, sell, or invest in real estate, our team is ready to assist you. <Link to="/Contact-us   " className="text-blue-500 underline">Contact us today</Link> to learn more about how we can help you achieve your real estate dreams.
            </p>
          </section>
          <footer className="mt-8">
            <p>Thank you for considering Homey Host as your trusted real estate partner. We look forward to working with you!</p>
          </footer>
        </div>
      </div>
    );
  };

  export default AboutUs;