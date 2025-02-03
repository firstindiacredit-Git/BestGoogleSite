import React, { useState } from 'react';

const ResumeForm = ({ onSubmit, themeColor, setThemeColor, selectedFormat, setSelectedFormat }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    contact: {
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    },
    skills: '',
    certifications: '',
    education: [{ institution: '', degree: '', duration: '', details: '' }],
    experience: [{ title: '', company: '', duration: '', details: '' }],
    projects: [{ name: '', description: '', technologies: '' }],
  });

  const handleChange = (e, section, index, field) => {
    if (section) {
      if (Array.isArray(formData[section])) {
        const newData = [...formData[section]];
        newData[index] = { ...newData[index], [field]: e.target.value };
        setFormData({ ...formData, [section]: newData });
      } else if (section === 'contact') {
        setFormData({
          ...formData,
          contact: { ...formData.contact, [field]: e.target.value },
        });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addItem = (section) => {
    const newItem = {
      education: { institution: '', degree: '', duration: '', details: '' },
      experience: { title: '', company: '', duration: '', details: '' },
      projects: { name: '', description: '', technologies: '' },
    }[section];

    setFormData({
      ...formData,
      [section]: [...formData[section], newItem],
    });
  };

  const removeItem = (section, index) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme and Format Selection */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-10 w-full rounded border-gray-200 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume Format</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Software Engineer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Brief overview of your professional background and goals"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => handleChange(e, 'contact', null, 'email')}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.contact.phone}
              onChange={(e) => handleChange(e, 'contact', null, 'phone')}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.contact.location}
              onChange={(e) => handleChange(e, 'contact', null, 'location')}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="text"
              value={formData.contact.linkedin}
              onChange={(e) => handleChange(e, 'contact', null, 'linkedin')}
              className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
        </div>
      </div>

      {/* Skills & Certifications */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800">Skills & Certifications</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="JavaScript, React, Node.js, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma-separated)</label>
          <textarea
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="AWS Certified Developer, Google Cloud Professional, etc."
          />
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Education</h3>
          <button
            type="button"
            onClick={() => addItem('education')}
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
          >
            Add Education
          </button>
        </div>
        {formData.education.map((edu, index) => (
          <div key={index} className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-700">Education #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeItem('education', index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleChange(e, 'education', index, 'institution')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Institution"
              />
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleChange(e, 'education', index, 'degree')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Degree"
              />
              <input
                type="text"
                value={edu.duration}
                onChange={(e) => handleChange(e, 'education', index, 'duration')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Duration"
              />
              <textarea
                value={edu.details}
                onChange={(e) => handleChange(e, 'education', index, 'details')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Additional details"
                rows="2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
          <button
            type="button"
            onClick={() => addItem('experience')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
          >
            Add Experience
          </button>
        </div>
        {formData.experience.map((exp, index) => (
          <div key={index} className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-700">Experience #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeItem('experience', index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={exp.title}
                onChange={(e) => handleChange(e, 'experience', index, 'title')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Job Title"
              />
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleChange(e, 'experience', index, 'company')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Company"
              />
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => handleChange(e, 'experience', index, 'duration')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Duration"
              />
              <textarea
                value={exp.details}
                onChange={(e) => handleChange(e, 'experience', index, 'details')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Job responsibilities and achievements"
                rows="2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
          <button
            type="button"
            onClick={() => addItem('projects')}
            className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm hover:bg-rose-200 transition-colors"
          >
            Add Project
          </button>
        </div>
        {formData.projects.map((project, index) => (
          <div key={index} className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-700">Project #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removeItem('projects', index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={project.name}
                onChange={(e) => handleChange(e, 'projects', index, 'name')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Project Name"
              />
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => handleChange(e, 'projects', index, 'technologies')}
                className="w-full rounded-lg border-gray-200 text-sm"
                placeholder="Technologies Used"
              />
              <textarea
                value={project.description}
                onChange={(e) => handleChange(e, 'projects', index, 'description')}
                className="w-full col-span-2 rounded-lg border-gray-200 text-sm"
                placeholder="Project description and your role"
                rows="2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Generate Resume
        </button>
      </div>
    </form>
  );
};

export default ResumeForm;
