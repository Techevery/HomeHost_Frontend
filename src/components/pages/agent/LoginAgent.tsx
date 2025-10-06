import React, { useMemo, useState, useEffect } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../UI/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useAgentStore from "../../../stores/agentstore"; 

const LoginAgent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  
  // Use the store
  const { login, isLoading, error, isAuthenticated, clearError, rememberMe, setRememberMe } = useAgentStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/AgentProfile');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const initialData = useMemo(() => ({
    email: rememberMe ? localStorage.getItem("username") || "" : "",
    password: "",
    remember: rememberMe,
  }), [rememberMe]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string().min(6, "Password must be a minimum of 6 characters").required("Required"),
  });

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    try {
      clearError();
      await login(values.email, values.password, values.remember);
      setRememberMe(values.remember);
    } catch (error) {
      // Error is handled in the store and will trigger the modal via useEffect
    }
  };

  const handleForgotPasswordSubmit = async () => {
    console.log(`Sending password reset email to ${forgotPasswordEmail}`);
    setIsForgotPasswordOpen(false);
  };

  return (
    <div className="md:px-[50px] pt-[40px]">
      <div className="flex pl-[50px] gap-4 items-center">
        <Link to="/">
          <img src="/images/Frame 67.svg" alt="Home" className="w-[35px] h-[35px]" />
        </Link>
        <h4 className="text-[#002221] text-[20px]">Login as an Agent</h4>
      </div>
      <div className="grid md:grid-cols-12 items-center">
        <div className="col-span-5">
          <div className="pl-[50px] pt-[25px] md:pt-[40px] pr-[20px] flex flex-col">
            <h4 className="text-[#000000] py-8 text-[30px]">Enter your email and your password.</h4>
            <Formik
              initialValues={initialData}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="w-full lg:mt-5 mb-6 flex flex-col justify-between">
                  <div className="mb-5">
                    <div className="relative mb-3">
                      <Field
                        className="block w-full h-14 text-center border pl-3 rounded-[15px] focus:outline-none border-[#002221]"
                        name="email"
                        type="email"
                        id="email"
                        placeholder="Email"
                      />
                      {errors.email && touched.email && (
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="email" />
                        </p>
                      )}
                    </div>
                    <div className="relative mb-3">
                      <Field
                        className="block w-full h-14 text-center border pl-3 rounded-[15px] focus:outline-none border-[#002221]"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Password"
                      />
                      <div
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </div>
                      {errors.password && touched.password && (
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="password" />
                        </p>
                      )}
                    </div>
                    <div className="flex items-center mb-3">
                      <Field
                        type="checkbox"
                        name="remember"
                        id="remember"
                        className="mr-2"
                      />
                      <label htmlFor="remember" className="text-sm">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-blue-500 text-xs mt-1"
                      onClick={() => setIsForgotPasswordOpen(true)}
                    >
                      Forgotten Password?
                    </button>
                  </div>
                  <Button text="Login" type="submit" disabled={isLoading} />
                  {isLoading && (
                    <div className="flex justify-center mt-4">
                      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin"></div>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="hidden md:block col-span-7">
          <img src="/images/Group 1446.svg" alt="Illustration" className="w-full h-full" />
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearError();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button text="Close" action={() => {
            setIsModalOpen(false);
            clearError();
          }} type="button" />
        </DialogActions>
      </Dialog>

      <Dialog
        open={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        aria-labelledby="forgot-password-dialog-title"
        aria-describedby="forgot-password-dialog-description"
      >
        <DialogTitle id="forgot-password-dialog-title">Forgot Password</DialogTitle>
        <DialogContent>
          <DialogContentText id="forgot-password-dialog-description">
            Enter your email address to receive a password reset link.
          </DialogContentText>
          <input
            type="email"
            className="w-full mt-2 p-2 border rounded"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            placeholder="Email"
          />
        </DialogContent>
        <DialogActions>
          <Button text="Cancel" action={() => setIsForgotPasswordOpen(false)} type="button" />
          <Button text="Submit" action={handleForgotPasswordSubmit} type="button" />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LoginAgent;