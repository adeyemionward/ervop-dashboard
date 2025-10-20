'use client';

import React, { useState } from 'react';
import { AccordionSection, InputField, ToggleSwitch } from '@/components/customization/pages/shared';
import { PlusCircle, Trash2 } from 'lucide-react';
import { WebsiteData } from '@/types/WebsiteTypes';

type TeamMember = { name: string; role: string; image: string };

type Props = {
  data: WebsiteData['about'] & {
    storyVisible?: boolean;
    teamVisible?: boolean;
    missionVisionVisible?: boolean;
  };
  onUpdate: (field: string, value: unknown) => void;
};


const AboutUsSection: React.FC<Props> = ({ data, onUpdate }) => {
  const [heroPreview, setHeroPreview] = useState<string | null>(data.heroImage ?? null);
  const [storyPreview, setStoryPreview] = useState<string | null>(data.storyImage ?? null);
  const teamMembers: TeamMember[] = Array.isArray(data.team) ? data.team : [];

  // Hero Image Upload
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setHeroPreview(url);
    onUpdate('heroImage', url);
  };

  // Story Image Upload
  const handleStoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setStoryPreview(url);
    onUpdate('storyImage', url);
  };

  // Team Image Upload
  const handleTeamImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updatedTeam = [...teamMembers];
    updatedTeam[index].image = url;
    onUpdate('team', updatedTeam);
  };

  const addTeamMember = () => {
    const newMember: TeamMember = { name: '', role: '', image: '' };
    onUpdate('team', [...teamMembers, newMember]);
  };

  const deleteTeamMember = (index: number) => {
    const updatedTeam = [...teamMembers];
    updatedTeam.splice(index, 1);
    onUpdate('team', updatedTeam);
  };

  return (
    <AccordionSection
      title="About Us Page"
      description="Customize your About Us content and team details."
      isVisible={data.visible ?? true}
      onToggle={() => onUpdate('visible', !data.visible)}
    >
      <div className="space-y-8">

        {/* HERO SECTION */}
        {data.visible && (
  <div>
    <h3 className="text-lg font-semibold mb-3">Hero Section</h3>

    <InputField
      label="Headline"
      value={data.heroHeadline ?? ''}
      onChange={(e) => onUpdate('heroHeadline', e.target.value)}
      placeholder="Enter main headline"
    />

    <InputField
      label="Subheadline"
      value={data.heroSubheadline ?? ''}
      onChange={(e) => onUpdate('heroSubheadline', e.target.value)}
      placeholder="Enter subheadline"
    />

    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
      <input type="file" accept="image/*" onChange={handleHeroImageUpload} />
      {heroPreview && (
        <div className="mt-3 relative w-60 h-36">
          <img
            src={heroPreview}
            alt="Hero Preview"
            className="w-full h-full object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  </div>
)}


        {/* STORY SECTION */}
        {(data.storyHeadline || data.storyDescription || data.yoe || data.customersServed || storyPreview) && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Our Story</h3>
              <ToggleSwitch
                isVisible={data.storyVisible ?? true}
                onToggle={() => onUpdate('storyVisible', !data.storyVisible)}
              />
            </div>
            {data.storyVisible && (
              <>
                <InputField
                  label="Headline"
                  value={data.storyHeadline ?? ''}
                  onChange={(e) => onUpdate('storyHeadline', e.target.value)}
                  placeholder="Enter headline"
                />
                <InputField
                  label="Description"
                  value={data.storyDescription ?? ''}
                  onChange={(e) => onUpdate('storyDescription', e.target.value)}
                  placeholder="Enter about us description"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Image</label>
                  <input type="file" accept="image/*" onChange={handleStoryImageUpload} />
                  {storyPreview && (
                    <div className="mt-2 w-60 h-36 rounded-lg overflow-hidden border">
                      <img src={storyPreview} alt="Story Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <InputField
                    label="Years of Experience"
                    value={data.yoe ?? ''}
                    onChange={(e) => onUpdate('yoe', e.target.value)}
                    placeholder="e.g. 10"
                  />
                  <InputField
                    label="Businesses Empowered"
                    value={data.customersServed ?? ''}
                    onChange={(e) => onUpdate('customersServed', e.target.value)}
                    placeholder="e.g. 500+"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* MISSION & VISION */}
        {(data.mission || data.vision) && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Mission & Vision</h3>
              <ToggleSwitch
                isVisible={data.missionVisionVisible ?? true}
                onToggle={() => onUpdate('missionVisionVisible', !data.missionVisionVisible)}
              />
            </div>
            {data.missionVisionVisible && (
              <>
                <InputField
                  label="Our Mission"
                  value={data.mission ?? ''}
                  onChange={(e) => onUpdate('mission', e.target.value)}
                  placeholder="Enter your mission statement"
                />
                <InputField
                  label="Our Vision"
                  value={data.vision ?? ''}
                  onChange={(e) => onUpdate('vision', e.target.value)}
                  placeholder="Enter your vision statement"
                />
              </>
            )}
          </div>
        )}

        {/* TEAM SECTION */}
        {teamMembers.length >= 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <ToggleSwitch
                isVisible={data.teamVisible ?? true}
                onToggle={() => onUpdate('teamVisible', !data.teamVisible)}
              />
            </div>
            {data.teamVisible && (
              <>
                {teamMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 relative">
                    <button
                      onClick={() => deleteTeamMember(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>

                    <InputField
                      label="Name"
                      value={member.name ?? ''}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[index].name = e.target.value;
                        onUpdate('team', updated);
                      }}
                    />
                    <InputField
                      label="Role"
                      value={member.role ?? ''}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[index].role = e.target.value;
                        onUpdate('team', updated);
                      }}
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                      <input type="file" accept="image/*" onChange={(e) => handleTeamImageUpload(index, e)} />
                      {member.image && (
                        <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border">
                          <img src={member.image} alt="Team Member" className="object-cover w-full h-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTeamMember}
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                >
                  <PlusCircle size={20} /> Add Team Member
                </button>
              </>
            )}
          </div>
        )}

       

      </div>
    </AccordionSection>
  );
};

export default AboutUsSection;
