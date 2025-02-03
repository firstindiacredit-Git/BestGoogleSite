import React from 'react';

const ResumePreview = ({ data, themeColor, selectedFormat }) => {
  const { name, title, summary, contact, skills, certifications, education, experience, projects } = data;

  const ModernTemplate = () => (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: themeColor }}>{name.toUpperCase()}</h1>
        <h2 className="text-xl mt-2" style={{ color: `${themeColor}99` }}>{title.toUpperCase()}</h2>
      </div>

      {/* Contact Info */}
      <div className="flex justify-center gap-4 mb-8 text-sm text-gray-600 flex-wrap">
        {contact.email && <span>{contact.email}</span>}
        {contact.phone && <span>• {contact.phone}</span>}
        {contact.location && <span>• {contact.location}</span>}
        {contact.linkedin && <span>• {contact.linkedin}</span>}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2" style={{ color: themeColor }}>PROFESSIONAL SUMMARY</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2" style={{ color: themeColor }}>SKILLS</h3>
          <div className="flex flex-wrap gap-2">
            {skills.split(',').map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>EXPERIENCE</h3>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                </div>
                <p className="mt-2 text-gray-700">{exp.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>EDUCATION</h3>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{edu.institution}</h4>
                    <p className="text-gray-600">{edu.degree}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.duration}</span>
                </div>
                {edu.details && <p className="mt-2 text-gray-700">{edu.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>PROJECTS</h3>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-800">{project.name}</h4>
                {project.technologies && (
                  <p className="text-sm text-gray-600 mt-1">
                    Technologies: {project.technologies}
                  </p>
                )}
                <p className="mt-2 text-gray-700">{project.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>CERTIFICATIONS</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {certifications.split(',').map((cert, index) => (
              <li key={index}>{cert.trim()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const ClassicTemplate = () => (
    <div className="p-8">
      {/* Header */}
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: themeColor }}>
        <h1 className="text-3xl font-bold text-center">{name}</h1>
        <h2 className="text-xl text-center text-gray-600 mt-2">{title}</h2>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600 flex-wrap">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>| {contact.phone}</span>}
          {contact.location && <span>| {contact.location}</span>}
          {contact.linkedin && <span>| {contact.linkedin}</span>}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1">
          {/* Skills */}
          {skills && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Skills
              </h3>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {skills.split(',').map((skill, index) => (
                  <li key={index}>{skill.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Education
              </h3>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-semibold">{edu.institution}</p>
                    <p>{edu.degree}</p>
                    <p className="text-gray-600">{edu.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && (
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Certifications
              </h3>
              <ul className="list-disc pl-4 text-sm space-y-1">
                {certifications.split(',').map((cert, index) => (
                  <li key={index}>{cert.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-2">
          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Professional Summary
              </h3>
              <p className="text-sm">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Experience
              </h3>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <strong>{exp.title}</strong>
                      <span>{exp.duration}</span>
                    </div>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="mt-1">{exp.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b" style={{ color: themeColor }}>
                Projects
              </h3>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="text-sm">
                    <strong>{project.name}</strong>
                    {project.technologies && (
                      <p className="text-gray-600">Technologies: {project.technologies}</p>
                    )}
                    <p className="mt-1">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const MinimalTemplate = () => (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light tracking-wide">{name}</h1>
        <h2 className="text-xl text-gray-600 mt-2">{title}</h2>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500 flex-wrap">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>• {contact.phone}</span>}
          {contact.location && <span>• {contact.location}</span>}
          {contact.linkedin && <span>• {contact.linkedin}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Summary */}
        {summary && (
          <section>
            <p className="text-gray-700 text-center max-w-2xl mx-auto">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {skills && (
          <section>
            <h3 className="text-center text-sm tracking-widest uppercase mb-3" style={{ color: themeColor }}>
              Skills
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 border rounded-full text-sm"
                  style={{ borderColor: `${themeColor}50`, color: themeColor }}
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-center text-sm tracking-widest uppercase mb-4" style={{ color: themeColor }}>
              Experience
            </h3>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-medium">{exp.title}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                  <p className="mt-2 text-gray-700 max-w-2xl mx-auto">{exp.details}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h3 className="text-center text-sm tracking-widest uppercase mb-4" style={{ color: themeColor }}>
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-medium">{edu.institution}</h4>
                  <p className="text-gray-600">{edu.degree}</p>
                  <p className="text-sm text-gray-500">{edu.duration}</p>
                  {edu.details && <p className="mt-1 text-gray-700">{edu.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h3 className="text-center text-sm tracking-widest uppercase mb-4" style={{ color: themeColor }}>
              Projects
            </h3>
            <div className="space-y-6">
              {projects.map((project, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-medium">{project.name}</h4>
                  {project.technologies && (
                    <p className="text-sm text-gray-600">{project.technologies}</p>
                  )}
                  <p className="mt-2 text-gray-700 max-w-2xl mx-auto">{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && (
          <section>
            <h3 className="text-center text-sm tracking-widest uppercase mb-3" style={{ color: themeColor }}>
              Certifications
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {certifications.split(',').map((cert, index) => (
                <span
                  key={index}
                  className="px-3 py-1 border rounded-full text-sm"
                  style={{ borderColor: `${themeColor}50`, color: themeColor }}
                >
                  {cert.trim()}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      {selectedFormat === 'modern' && <ModernTemplate />}
      {selectedFormat === 'classic' && <ClassicTemplate />}
      {selectedFormat === 'minimal' && <MinimalTemplate />}
    </div>
  );
};

export default ResumePreview;
