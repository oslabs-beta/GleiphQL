import React, { useState } from 'react';
import ProfileCard from './ProfileCard';

const MeetTheTeam: React.FC<{}> = () => {

  return (
    <>
      <div className=''>
        <h3>Meet the Team</h3>
      </div>
      
      <div className='flex flex-wrap'>
        <ProfileCard
          imageSrc = '/images/JDong.png'
          memberName = 'Jiecheng Dong'
          githubLink = 'https://github.com/jiedong111'
          linkedinLink = 'https://www.linkedin.com/in/jiecheng-dong-1522b8248/'
        />

        <ProfileCard
          imageSrc='/images/ALarkin.jpg'
          memberName='Andrew Larkin'
          githubLink='https://github.com/larkinaj'
          linkedinLink='https://www.linkedin.com/in/andrew-larkin-71395940/'
        />

        <ProfileCard
          imageSrc='/images/KPhan.jpg'
          memberName='Kevin Phan'
          githubLink='https://github.com/KP824'
          linkedinLink='https://www.linkedin.com/in/kevinphan760/'
        />

        <ProfileCard
          imageSrc='/images/YYoon.jpg'
          memberName='Yeong Sil Yoon'
          githubLink='https://github.com/wendyys96'
          linkedinLink=''
        />
      </div>
    </>
  );
};

export default MeetTheTeam;