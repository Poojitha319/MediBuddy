import React from 'react';
import { TypeAnimation } from 'react-type-animation';

const AboutPage = () => {
  return (
    <section id="about" className="min-h-screen px-6 py-20 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">About MeddiBuddy</h2>

        <div className="text-lg leading-relaxed text-gray-700">
          <TypeAnimation
            sequence={[
              'MeddiBuddy is a medical imaging assistant platform that allows healthcare professionals to upload, visualize, and analyze DICOM files.',
              1000,
              'Our goal is to simplify complex medical image processing with an intuitive interface and AI-powered features.',
              1000,
              'User-friendly design tailored for elderly users, supporting services in their local languages.',
              1000,
              'MeddiBuddy bridges the gap between advanced medical imaging and user-friendly web tools.',
            ]}
            speed={100}
            style={{ whiteSpace: 'pre-line', display: 'inline-block' }}
            repeat={0} // Type only once
            cursor={true}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
