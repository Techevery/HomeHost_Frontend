import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { Transition } from '@headlessui/react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Popover, Button, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';

const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <div className='relative h-screen'>
        <div className='pb-20 object-cover h-full w-full'>
          <img
            src='/images/bg.svg'
            alt=''
            className='object-cover absolute w-full h-full'
          />
          <div className='max-w-screen-xl px-5 lg:px-14 mx-auto lg:gap-8 xl:gap-12'>
            <div className='flex justify-between items-center pt-10 px-4 mx-auto lg:px-5'>
              <NavLink to='/' className='z-10'>
                <img src='/images/logo.svg' alt='location' className='' />
              </NavLink>
              <div className='z-10 pl-44 md:pl-1'>
                <IconButton
                  onClick={toggleDrawer(true)}
                  className='inline-flex items-center p-2 ml-1 text-sm rounded-lg md:hidden hover:bg-gray-100'
                  aria-label='open drawer'
                >
                  <MdMenu className='w-7 h-7 text-amber-400 md:hidden' />
                </IconButton>
              </div>

              <div
                className='items-center justify-between gap-10 hidden w-full md:flex md:w-auto'
                id='navbar-sticky'
              >
                <div className='flex flex-col mt-5 font-medium md:flex-row lg:space-x-3 items-center ml-[80px]'>
                  <NavLink
                    to='/About'
                    className='flex space-x-2 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-[#3f71a8] lg:pb-5'
                    style={({ isActive }) =>
                      isActive
                        ? { color: '#FFFFFF', fontWeight: '600' }
                        : { color: '#FFFFFF' }
                    }
                  >
                    About
                  </NavLink>

                  <NavLink
                    to='/Contact-Us'
                    className='flex space-x-4 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-[#3f71a8] lg:pb-5'
                    style={({ isActive }) =>
                      isActive
                        ? { color: '#777777', fontWeight: '600' }
                        : { color: '#FFFFFF' }
                    }
                  >
                    Contact Us
                  </NavLink>
                  <NavLink
                    to='/manage-booking'
                    className='flex space-x-4 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:pb-5'
                    style={({ isActive }) =>
                      isActive
                        ? { color: '#777777', fontWeight: '600' }
                        : { color: '#FFFFFF' }
                    }
                  >
                    Manage Booking
                  </NavLink>

                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      onClick={handlePopoverOpen}
                    >
                      <h5 className='text-black z-10 text-[20px] font-[600]'>Login</h5>
                    </AccordionSummary>
                  </Accordion>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-2 h-full text-white'>
              <h4 className='text-white pt-[150px] leading-[50px] md:leading-[90px] z-10 text-[60px] md:text-[110px] font-[600] md:font-[700]'>
                Explore <br />
                your space
              </h4>
              <div className='pt-20 z-10'>
                <Link
                  to='/view-properties'
                  className='bg-[#D0AB41] rounded-[5px] md:rounded-[10px] md:px-8 px-5 md:py-3 py-2'
                >
                  View properties
                </Link>
              </div>
            </div>
          </div>
          <div className='overlay absolute inset-0 bg-black opacity-40'></div>
        </div>
      </div>

      <Drawer anchor='left' open={drawerOpen} onClose={toggleDrawer(false)}>
        <List>
          <ListItem button component={NavLink} to='/About' onClick={toggleDrawer(false)}>
            <ListItemText primary='About' />
          </ListItem>
          <ListItem button component={NavLink} to='/Contact-Us' onClick={toggleDrawer(false)}>
            <ListItemText primary='Contact Us' />
          </ListItem>
          <ListItem button component={NavLink} to='/manage-booking' onClick={toggleDrawer(false)}>
            <ListItemText primary='Manage Booking' />
          </ListItem>
          <ListItem button onClick={handlePopoverOpen}>
            <ListItemText primary='Login' />
          </ListItem>
        </List>
      </Drawer>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          style: {
            padding: '16px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          },
        }}
      >
        <div className='flex flex-col'>
          <NavLink
            className='text-black text-[16px] font-medium hover:text-blue-600 transition-colors duration-200 mb-2'
            to={'/become-agent'}
            onClick={handlePopoverClose}
          >
            Become an Agent
          </NavLink>
          <NavLink
            className='text-black text-[16px] font-medium hover:text-blue-600 transition-colors duration-200 mb-2'
            to={'/agent-login'}
            onClick={handlePopoverClose}
          >
            Login as an Agent
          </NavLink>
          <NavLink
            className='text-black text-[16px] font-medium hover:text-blue-600 transition-colors duration-200'
            to={'/Admin-login'}
            onClick={handlePopoverClose}
          >
            Admin
          </NavLink>
        </div>
      </Popover>
    </div>
  );
};

export default Home;