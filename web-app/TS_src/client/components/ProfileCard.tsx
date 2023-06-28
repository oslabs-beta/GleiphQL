import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

interface ProfileCardProps {
  imageSrc: string;
  memberName: string;
  githubLink: string;
  linkedinLink: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  imageSrc,
  memberName,
  githubLink,
  linkedinLink,
}) => {
  return (
    <div className='bg-black rounded-lg shadow-md p-4'>
      {/* Image */}
      <div className='w-10 h-15 mb-4'>
        <img 
          src={imageSrc} 
          alt='Profile' 
          className='object-cover w-full h-full rounded-full'
          style={{ width: '100%', height: '100%' }}
          />
      </div>
      

      {/* Member Name */}
      <div className='text-center mb-4'>
        <h2 className='text-xl font-bold'>{memberName}</h2>
      </div>

      {/* Icons */}
      <div className='flex justify-center'>
        <a href={githubLink} target='_blank' rel='noopener noreferrer' className='mr-4'>
          <FaGithub size={48} />
        </a>
        <a href={linkedinLink} target='_blank' rel='noopener referrer'>
          <FaLinkedin size={48} />
        </a>

      </div>
    </div>
  );
};

export default ProfileCard;