import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Popover, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import useBannerStore from '../../stores/bannerStore';

// Import our custom carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/UI/carousel";

const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  
  // Get banners from store
  const { banners, fetchBanners } = useBannerStore();
  
  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Track current slide
  useEffect(() => {
    if (!api) return;
    
    // Set up a simple way to track the current slide
    const interval = setInterval(() => {
      setCurrent(api.selectedScrollSnap ? api.selectedScrollSnap() : 0);
    }, 100);
    
    return () => clearInterval(interval);
  }, [api]);

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
  
  const hasBanners = banners && banners.length > 0;

  return (
    <div className="relative">
      <div className='relative h-screen overflow-hidden'>
        {/* Carousel container */}
        {hasBanners ? (
          <Carousel className="w-full h-full absolute inset-0" setApi={setApi}>
            <CarouselContent className="h-full">
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id || index} className="h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="object-cover w-full h-full"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                    
                    {/* Banner content */}
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div className="text-white z-20 max-w-2xl mx-auto px-4">
                          {banner.title && (
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-lg md:text-xl">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Only show navigation if there are multiple banners */}
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
                
                {/* Carousel indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        current === index 
                          ? 'bg-white scale-110' 
                          : 'bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        ) : (
          // Fallback background image
          <div className="relative h-full w-full">
            <img
              src='/images/bg.svg'
              alt=''
              className='object-cover absolute w-full h-full'
            />
            <div className='absolute inset-0 bg-black opacity-40'></div>
          </div>
        )}
        
        {/* Navigation bar - positioned absolutely over the carousel */}
        <div className="absolute top-0 left-0 w-full z-30">
          <div className='max-w-screen-xl px-5 lg:px-14 mx-auto'>
            <div className='flex justify-between items-center pt-6'>
              <NavLink to='/' className='z-10'>
                <img src='/images/logo.svg' alt='location' className='h-8 md:h-10' />
              </NavLink>
              
              <div className='z-10'>
                <IconButton
                  onClick={toggleDrawer(true)}
                  className='inline-flex items-center p-2 ml-1 text-sm rounded-lg md:hidden hover:bg-gray-100'
                  aria-label='open drawer'
                  sx={{ color: 'white' }}
                >
                  <MdMenu className='w-7 h-7 text-amber-400 md:hidden' />
                </IconButton>
              </div>

              <div
                className='items-center justify-between gap-10 hidden w-full md:flex md:w-auto'
                id='navbar-sticky'
              >
                <div className='flex flex-col mt-5 font-medium md:flex-row lg:space-x-8 items-center'>
                  <NavLink
                    to='/About'
                    className='flex space-x-2 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-400 lg:pb-5 transition-all duration-300'
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
                    className='flex space-x-4 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-400 lg:pb-5 transition-all duration-300'
                    style={({ isActive }) =>
                      isActive
                        ? { color: '#FFFFFF', fontWeight: '600' }
                        : { color: '#FFFFFF' }
                    }
                  >
                    Contact Us
                  </NavLink>
                  <NavLink
                    to='/manage-booking'
                    className='flex space-x-4 z-10 py-2 pr-4 text-sm tracking-wider font-normal hover:font-semibold leading-5 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-400 lg:pb-5 transition-all duration-300'
                    style={({ isActive }) =>
                      isActive
                        ? { color: '#FFFFFF', fontWeight: '600' }
                        : { color: '#FFFFFF' }
                    }
                  >
                    Manage Booking
                  </NavLink>

                  <div className="relative">
                    <Accordion 
                      sx={{ 
                        backgroundColor: 'transparent', 
                        boxShadow: 'none',
                        color: 'white',
                        '&:before': { display: 'none' }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        onClick={handlePopoverOpen}
                        sx={{ 
                          minHeight: 'auto', 
                          padding: 0,
                          '& .MuiAccordionSummary-content': { margin: 0 }
                        }}
                      >
                        <h5 className='text-white z-10 text-[16px] font-[600] hover:text-amber-400 transition-colors duration-300'>Login</h5>
                      </AccordionSummary>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className='absolute inset-0 flex items-center justify-center z-20'>
          <div className='max-w-screen-xl w-full px-5 lg:px-14 mx-auto'>
            <div className='flex flex-col gap-2 text-white'>
              <h4 className='text-white leading-[50px] md:leading-[90px] z-10 text-[50px] md:text-[100px] font-[600] md:font-[700] text-center'>
                Explore <br />
                your space
              </h4>
              <p className="text-center text-lg md:text-xl max-w-2xl mx-auto mt-4">
                Discover amazing places and create unforgettable memories
              </p>
              
            </div>
          </div>
        </div>
      </div>

      <Drawer 
        anchor='left' 
        open={drawerOpen} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1a365d',
            color: 'white'
          }
        }}
      >
        <div className="p-4 flex justify-end">
          <IconButton onClick={toggleDrawer(false)} sx={{ color: 'white' }}>
            <IoMdClose className="w-6 h-6" />
          </IconButton>
        </div>
        <List>
          <ListItem 
            button 
            component={NavLink} 
            to='/About' 
            onClick={toggleDrawer(false)}
            sx={{ color: 'white', '&:hover': { backgroundColor: '#2d3748' } }}
          >
            <ListItemText primary='About' />
          </ListItem>
          <ListItem 
            button 
            component={NavLink} 
            to='/Contact-Us' 
            onClick={toggleDrawer(false)}
            sx={{ color: 'white', '&:hover': { backgroundColor: '#2d3748' } }}
          >
            <ListItemText primary='Contact Us' />
          </ListItem>
          <ListItem 
            button 
            component={NavLink} 
            to='/manage-booking' 
            onClick={toggleDrawer(false)}
            sx={{ color: 'white', '&:hover': { backgroundColor: '#2d3748' } }}
          >
            <ListItemText primary='Manage Booking' />
          </ListItem>
          <ListItem 
            button 
            onClick={handlePopoverOpen}
            sx={{ color: 'white', '&:hover': { backgroundColor: '#2d3748' } }}
          >
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