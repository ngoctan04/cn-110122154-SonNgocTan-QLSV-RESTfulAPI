import React ,{useState} from 'react'
import './adduser.css'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddUser = () => {

    const users = {
        name: '',
        email: '',
        mssv: '',
        phone: '',
        address: '',
        gender: 'Khác',
        classId: '',
        className: '',
        majorId: '',
        majorName: '',
        joinDate: new Date().toISOString().split('T')[0]
    }
    const [user, setUser] = useState(users);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [majors, setMajors] = useState([]);
    const navigate = useNavigate();

    // Fetch classes and majors for dropdowns
    React.useEffect(() => {
        const fetch = async () => {
            try {
                const [cRes, mRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/class/dropdown'),
                    axios.get('http://localhost:8000/api/major/all?page=1&limit=100')
                ]);
                if (cRes.data.success) setClasses(cRes.data.data);
                if (mRes.data.success) setMajors(mRes.data.data);
            } catch (err) {
                console.error('Error fetching classes/majors:', err);
            }
        };
        fetch();
    }, []);

    const inputHandler = (e) => {
        const { name, value } = e.target;
        // If selecting classId or majorId, also set the corresponding name for display/backcompat
        if (name === 'classId') {
            const cls = classes.find(c => c._id === value);
            setUser({ ...user, classId: value, className: cls ? cls.className : '' });
        } else if (name === 'majorId') {
            const mj = majors.find(m => m._id === value);
            setUser({ ...user, majorId: value, majorName: mj ? mj.majorName : '' });
        } else {
            // typing into className clears any selected classId
            if (name === 'className') {
                setUser({ ...user, className: value, classId: '' });
            } else if (name === 'majorName') {
                setUser({ ...user, majorName: value, majorId: '' });
            } else {
                setUser({ ...user, [name]: value });
            }
        }

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!user.name.trim()) {
            newErrors.name = "Tên sinh viên là bắt buộc";
        } else if (user.name.length < 3) {
            newErrors.name = "Tên phải có ít nhất 3 ký tự";
        }

        if (!user.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!user.address.trim()) {
            newErrors.address = "Địa chỉ là bắt buộc";
        } else if (user.address.length < 5) {
            newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
        }

        if (user.phone && !/^(\+84|0)[0-9]{9,10}$/.test(user.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const submitForm = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại form", { position: "top-right" });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/user', user, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.message, { position: "top-right" });
                // Reset form
                setUser(users);
                // Navigate back to students list in admin and reload
                    setTimeout(() => {
                    navigate('/students');
                    window.location.reload(); // Or use context/state management to refresh
                }, 500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
            toast.error(errorMsg, { position: "top-right" });
            console.error('Error:', errorMsg);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='addUser'>
        <div className='add-user-header'>
            <div className='back-button-wrapper'>
                <Link to='/students' className='back-button'>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Trở về</span>
                </Link>
            </div>
            <h2 className='page-title'>
                <i className="fa-solid fa-user-plus"></i>
                Thêm Sinh Viên Mới
            </h2>
        </div>
        <form className='addUserForm' onSubmit={submitForm}>
            <div className='inputGroup'>
                <label htmlFor='name'>Họ và Tên: <span style={{color: 'red'}}>*</span></label>
                <input 
                type='text'
                id="name"
                onChange={inputHandler}
                name='name'
                autoComplete='off'
                placeholder='Nhập họ và tên'
                value={user.name}
                className={errors.name ? 'form-control is-invalid' : 'form-control'}
                />
                {errors.name && <div className='text-danger small mt-1'>{errors.name}</div>}
            </div>

             <div className='inputGroup'>
                <label htmlFor='email'>Email <span style={{color: 'red'}}>*</span></label>
                <input 
                type='email'
                id="email"
                onChange={inputHandler}
                name='email'
                autoComplete='off'
                placeholder='Nhập email'
                value={user.email}
                className={errors.email ? 'form-control is-invalid' : 'form-control'}
                />
                {errors.email && <div className='text-danger small mt-1'>{errors.email}</div>}
            </div>

            <div className='inputGroup'>
                <label htmlFor='mssv'>MSSV <small className='text-muted'>(Mặc định: 110122xxx nếu để trống)</small></label>
                <input 
                type='text'
                id="mssv"
                onChange={inputHandler}
                name='mssv'
                autoComplete='off'
                placeholder='VD: 110122001 (để trống sẽ sinh tự động)'
                value={user.mssv}
                className='form-control'
                />
            </div>

            <div className='inputGroup'>
                <label htmlFor='phone'>Số điện thoại</label>
                <input 
                type='tel'
                id="phone"
                onChange={inputHandler}
                name='phone'
                placeholder='Ví dụ: 0912345678'
                value={user.phone}
                className={errors.phone ? 'form-control is-invalid' : 'form-control'}
                />
                {errors.phone && <div className='text-danger small mt-1'>{errors.phone}</div>}
            </div>

             <div className='inputGroup'>
                <label htmlFor='address'>Địa chỉ: <span style={{color: 'red'}}>*</span></label>
                <input 
                type='text'
                id="address"
                onChange={inputHandler}
                name='address'
                placeholder='Nhập địa chỉ'
                value={user.address}
                className={errors.address ? 'form-control is-invalid' : 'form-control'}
                />
                {errors.address && <div className='text-danger small mt-1'>{errors.address}</div>}
            </div>

            <div className='inputGroup'>
                <label htmlFor='gender'>Giới tính</label>
                <select 
                id="gender"
                name='gender'
                onChange={inputHandler}
                value={user.gender}
                className='form-control'
                >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>

            <div className='inputGroup'>
                <label htmlFor='classId'>Lớp</label>
                <select 
                    id="classId"
                    name="classId"
                    value={user.classId}
                    onChange={inputHandler}
                    className='form-control'
                >
                    <option value="">-- Chọn lớp (hoặc nhập thủ công) --</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.className}</option>
                    ))}
                </select>
                <small className='text-muted'>Hoặc nhập tên lớp thủ công:</small>
                <input 
                    type='text'
                    id="className"
                    onChange={inputHandler}
                    name='className'
                    placeholder='Ví dụ: 12A1'
                    value={user.className}
                    className='form-control mt-1'
                />
            </div>

            <div className='inputGroup'>
                <label htmlFor='majorId'>Chuyên ngành</label>
                <select 
                    id="majorId"
                    name="majorId"
                    value={user.majorId}
                    onChange={inputHandler}
                    className='form-control'
                >
                    <option value="">-- Chọn chuyên ngành (hoặc nhập thủ công) --</option>
                    {majors.map(m => (
                        <option key={m._id} value={m._id}>{m.majorName}</option>
                    ))}
                </select>
                <small className='text-muted'>Hoặc nhập tên chuyên ngành thủ công:</small>
                <input 
                    type='text'
                    id="majorName"
                    onChange={inputHandler}
                    name='majorName'
                    placeholder='Ví dụ: Công nghệ thông tin'
                    value={user.majorName}
                    className='form-control mt-1'
                />
            </div>

            <div className='inputGroup'>
                <label htmlFor='joinDate'>Ngày nhập học</label>
                <input 
                type='date'
                id="joinDate"
                onChange={inputHandler}
                name='joinDate'
                value={user.joinDate}
                className='form-control'
                />
            </div>

            <div className='inputGroup'>
                <button 
                type='submit' 
                className='btn btn-primary'
                disabled={loading}
                >
                    {loading ? 'Đang xử lý...' : 'Thêm Sinh Viên'}
                </button>
            </div>
        </form>
        </div>
  )
}

export default AddUser