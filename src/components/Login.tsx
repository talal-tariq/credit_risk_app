import { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import loginImage from '../assets/images/login-image.jpg';
import logo from '../assets/images/ubl-logo.png';
import { useStore } from '../store/useStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { setActiveView } = useStore();
    const users: { email: string; password: string }[] = [
        { email: "admin@consumer.com", password: "admin1234" },
    ];

    const validateField = (name: 'email' | 'password', value: string) => {
        let error = '';
        switch (name) {
            case 'email':
                if (!value) {
                    error = 'Email address is required.';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    error = 'Please enter a valid email address.';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password is required.';
                }
                break;
            default:
                break;
        }
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
        return !error;
    };

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);

        if (isEmailValid && isPasswordValid) {

            const user = users.find(
                (u) => u.email === email && u.password === password
            );


            if (user) {
                toast.success('Login successful!', {
                    position: 'top-center',
                    autoClose: 1500,
                });

                setTimeout(() => {
                    setActiveView('start');
                }, 1500);
            } else {
                toast.error('Invalid email or password.', {
                    position: 'top-center',
                    autoClose: 3000,
                });
            }
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${loginImage})` }}
        >
            <div className="absolute inset-0 bg-slate-900/50" />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 px-8 py-10 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <img src={logo} alt="Company Logo" className="h-14 w-auto" />
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold text-slate-600">Welcome Back</h2>
                        <p className="mt-1 text-sm text-slate-500">Please enter your credentials to log in.</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} noValidate className="mt-8 space-y-4">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#1a5a7a] shadow-sm">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) validateField('email', e.target.value);
                                }}
                                onBlur={() => validateField('email', email)}
                                required
                            />
                        </div>
                    </div>
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}

                    <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#1a5a7a] shadow-sm">
                                <FaLock />
                            </div>
                            <input
                                type="password"
                                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) validateField('password', e.target.value);
                                }}
                                onBlur={() => validateField('password', password)}
                                required
                            />
                        </div>
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-white transition-colors enabled:bg-[#1a5a7a] enabled:hover:bg-[#2980b9] disabled:cursor-not-allowed"
                        disabled={!email || !password}
                    >
                        LOG IN
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;
