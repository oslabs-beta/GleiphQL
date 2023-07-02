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
    <div className='profile-card'>
      <div 
        /* background-(color)-(strength), rounded edges-(strength), overflow - too large content is hidden, box shadow (medium), box-content controls containers size, height - (75 * 0.25 rem) */
        className='bg-gray-200 rounded-lg overflow-hidden shadow-lg box-content min-h-75 min-w-250 justify-center m-5'
        >
        {/* Image */}
        <div className='box border h-40 w-auto b-4 mb-4'>
          <img 
            src={imageSrc} 
            alt='Profile' 
            className='w-full h-full rounded'
            />
        </div>
        

        {/* Member Name */}
        <div className='text-center mb-4'>
          <h2 className='text-xl font-bold'>{memberName}</h2>
        </div>

        {/* Icons */}
        <div className='flex justify-center mb-2'>
          <a href={githubLink} target='_blank' rel='noopener noreferrer' className='mr-4'>
            <FaGithub size={48} />
          </a>
          <a href={linkedinLink} target='_blank' rel='noopener referrer'>
            <FaLinkedin size={48} />
          </a>

        </div>
      </div>
    </div>
  );
};

export default ProfileCard;