import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const CATEGORIES = ['Flooring', 'Walls', 'Ceiling', 'Furniture', 'Lighting', 'Kitchen', 'Other']

const EMPTY_FORM = { label: '', materialName: '', category: '', brand: '', unit: '', price: '', stock: '' }

// ── Reusable field input ───────────────────────────────────────────────────────
const Field = ({ icon, label, children }) => (
  <div>
    <label className='block text-black font-medium mb-1.5 text-sm'>{label}</label>
    <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
      <i className={`${icon} text-[#883bbc] shrink-0`}></i>
      {children}
    </div>
  </div>
)

const inputCls = 'flex-1 bg-transparent outline-none font-semibold text-sm placeholder:opacity-50 w-full'

const AdminMaterial = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [materials, setMaterials] = useState([])
  const [loading, setLoading]     = useState(true)

  // create form
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  // inline edit
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState(EMPTY_FORM)

  const setField  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setEField = (k, v) => setEditForm(f => ({ ...f, [k]: v }))

  const fetchMaterials = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/material/all`, { withCredentials: true })
      setMaterials(data.materials || [])
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMaterials() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.label.trim() || !form.materialName.trim()) return showPopcard('Label and material name are required.', false, 2000)
    setSaving(true)
    try {
      await axios.post(`${API_BASE}/material/create`, {
        label:        form.label.trim(),
        materialName: form.materialName.trim(),
        category:     form.category,
        brand:        form.brand.trim(),
        unit:         form.unit.trim(),
        price:        Number(form.price) || 0,
        stock:        Number(form.stock) || 0,
      }, { withCredentials: true })
      showPopcard('Material added!', true, 1500)
      setForm(EMPTY_FORM)
      setFormOpen(false)
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (mat) => {
    setEditingId(mat._id)
    setEditForm({
      label:        mat.label        || '',
      materialName: mat.materialName || '',
      category:     mat.category     || '',
      brand:        mat.brand        || '',
      unit:         mat.unit         || '',
      price:        String(mat.price ?? ''),
      stock:        String(mat.stock ?? ''),
    })
  }

  const cancelEdit = () => { setEditingId(null); setEditForm(EMPTY_FORM) }

  const handleUpdate = async (id) => {
    if (!editForm.label.trim() || !editForm.materialName.trim()) return showPopcard('Label and material name are required.', false, 2000)
    try {
      await axios.post(`${API_BASE}/material/update`, {
        id,
        label:        editForm.label.trim(),
        materialName: editForm.materialName.trim(),
        category:     editForm.category,
        brand:        editForm.brand.trim(),
        unit:         editForm.unit.trim(),
        price:        Number(editForm.price) || 0,
        stock:        Number(editForm.stock) || 0,
      }, { withCredentials: true })
      showPopcard('Updated!', true, 1500)
      cancelEdit()
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.post(`${API_BASE}/material/delete`, { id }, { withCredentials: true })
      showPopcard('Deleted.', true, 1500)
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  const handleToggleDefault = async (id) => {
    try {
      await axios.post(`${API_BASE}/material/set-default`, { id }, { withCredentials: true })
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  // ── Shared form fields JSX (used by both create and edit) ──────────────────
  const renderFields = (values, setter) => (
    <div className='space-y-3'>
      {/* Label + Material Name */}
      <div className='grid grid-cols-2 gap-3'>
        <Field icon='ri-price-tag-3-line' label='Label *'>
          <input type='text' value={values.label} onChange={e => setter('label', e.target.value)}
            placeholder='e.g. MAT-001' className={inputCls} />
        </Field>
        <Field icon='ri-stack-line' label='Material Name *'>
          <input type='text' value={values.materialName} onChange={e => setter('materialName', e.target.value)}
            placeholder='e.g. Marble Tile' className={inputCls} />
        </Field>
      </div>

      {/* Category dropdown */}
      <div>
        <label className='block text-black font-medium mb-1.5 text-sm'>Category</label>
        <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
          <i className='ri-layout-grid-line text-[#883bbc] shrink-0'></i>
          <select
            value={values.category}
            onChange={e => setter('category', e.target.value)}
            className='flex-1 bg-transparent outline-none font-semibold text-sm appearance-none'
          >
            <option value=''>Select category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Brand + Unit */}
      <div className='grid grid-cols-2 gap-3'>
        <Field icon='ri-building-2-line' label='Brand'>
          <input type='text' value={values.brand} onChange={e => setter('brand', e.target.value)}
            placeholder='e.g. Asian Paints' className={inputCls} />
        </Field>
        <Field icon='ri-ruler-line' label='Unit'>
          <input type='text' value={values.unit} onChange={e => setter('unit', e.target.value)}
            placeholder='e.g. sqft' className={inputCls} />
        </Field>
      </div>

      {/* Price + Stock */}
      <div className='grid grid-cols-2 gap-3'>
        <Field icon='ri-money-rupee-circle-line' label='Price (₹)'>
          <input type='number' min='0' value={values.price} onChange={e => setter('price', e.target.value)}
            placeholder='0' className={inputCls} />
        </Field>
        <Field icon='ri-archive-line' label='Stock'>
          <input type='number' min='0' value={values.stock} onChange={e => setter('stock', e.target.value)}
            placeholder='0' className={inputCls} />
        </Field>
      </div>
    </div>
  )

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      <AnimatePresence>
        {popcard.visible && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            key={popcard.message}
            animate={{ opacity: 1, scaleY: 1, transformOrigin: 'top' }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            exit={{ opacity: 0, scaleY: 0 }}
            className='w-[80%] md:w-[40%] h-[10%] rounded-lg absolute z-20 top-0 left-0'
          >
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-2'>
              <h1>Material</h1>
              <h1 className='text-white'>List</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-full md:w-[70%] border-b-2 pb-[6%] border-white'>
                Manage materials and vendors used across projects
              </h4>
            </div>
          </header>

          {/* ── Materials list ───────────────────────────────────────────── */}
          <section className='w-full relative z-10 mt-[5%] space-y-3'>
            {loading ? (
              <div className='flex justify-center py-8'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : materials.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No materials yet. Add one below.</p>
              </div>
            ) : (
              <AnimatePresence>
                {materials.map((mat, i) => (
                  <motion.div
                    key={mat._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className='rounded-lg bg-gradient-to-br from-[#F7D6F3]/60 to-transparent border border-[#883bbc]/40 overflow-hidden'
                  >
                    {editingId !== mat._id ? (
                      /* ── View row ── */
                      <div className='px-4 py-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <p className='font-bold text-base truncate'>{mat.label}</p>
                              {mat.category && (
                                <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#883bbc]/10 text-[#883bbc] shrink-0'>
                                  {mat.category}
                                </span>
                              )}
                              {mat.isDefault && (
                                <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full border text-[#883bbc] bg-[#F7D6F3] border-[#883bbc]/40 shrink-0'>
                                  default
                                </span>
                              )}
                            </div>
                            <p className='text-sm opacity-60 font-semibold truncate mt-0.5'>{mat.materialName}</p>
                            <div className='flex items-center gap-3 mt-1.5 flex-wrap'>
                              {mat.brand && (
                                <span className='text-xs opacity-50 font-semibold flex items-center gap-1'>
                                  <i className='ri-building-2-line text-[10px]'></i>{mat.brand}
                                </span>
                              )}
                              {mat.unit && (
                                <span className='text-xs opacity-50 font-semibold flex items-center gap-1'>
                                  <i className='ri-ruler-line text-[10px]'></i>{mat.unit}
                                </span>
                              )}
                              {mat.price > 0 && (
                                <span className='text-xs font-bold text-[#883bbc] flex items-center gap-0.5'>
                                  <i className='ri-money-rupee-circle-line text-[10px]'></i>
                                  {Number(mat.price).toLocaleString('en-IN')}
                                </span>
                              )}
                              {mat.stock !== undefined && (
                                <span className={`text-xs font-bold flex items-center gap-1
                                  ${mat.stock === 0 ? 'text-red-500' : mat.stock < 20 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                  <i className='ri-archive-line text-[10px]'></i>
                                  {mat.stock === 0 ? 'Out of stock' : mat.stock < 20 ? `Low (${mat.stock})` : mat.stock}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 shrink-0'>
                            <motion.button
                              onClick={() => handleToggleDefault(mat._id)}
                              whileTap={{ scale: 0.9 }}
                              title={mat.isDefault ? 'Remove default' : 'Set as default'}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm
                                ${mat.isDefault ? 'bg-[#F7D6F3] border-[#883bbc] text-[#883bbc]' : 'bg-white/60 border-[#883bbc]/30 text-[#883bbc]/50'}`}
                            >
                              <i className='ri-star-fill'></i>
                            </motion.button>
                            <motion.button
                              onClick={() => openEdit(mat)}
                              whileTap={{ scale: 0.9 }}
                              className='w-8 h-8 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc]'
                            >
                              <i className='ri-edit-2-line text-sm'></i>
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(mat._id)}
                              whileTap={{ scale: 0.9 }}
                              className='w-8 h-8 rounded-full bg-red-50 border border-red-300 flex items-center justify-center text-red-400'
                            >
                              <i className='ri-delete-bin-line text-sm'></i>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── Inline edit row ── */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='px-4 py-4 space-y-3'
                      >
                        <p className='text-sm font-bold text-[#883bbc] mb-1'>Edit Material</p>
                        {renderFields(editForm, setEField)}
                        <div className='flex gap-2 pt-1'>
                          <button
                            type='button'
                            onClick={cancelEdit}
                            className='flex-1 border border-[#883bbc] rounded-full py-2.5 text-sm font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent'
                          >
                            Cancel
                          </button>
                          <motion.button
                            type='button'
                            onClick={() => handleUpdate(mat._id)}
                            whileTap={{ scale: 0.97 }}
                            className='flex-1 bg-[#883bbc] text-white rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5'
                          >
                            <i className='ri-save-line'></i> Save
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </section>

          {/* ── Add material form ────────────────────────────────────────── */}
          <section className='w-full relative z-10 pb-20 mt-[5%]'>
            <h1 className='text-xl font-bold'>Add Material :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p className='text-sm font-semibold opacity-70'>Add a new material with full details.</p>
                    <motion.div
                      layoutId='material-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-add-circle-fill'></i>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='border border-[#883bbc] w-full mt-[4%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleCreate}
                    className='px-3 py-4 space-y-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    {renderFields(form, setField)}

                    <div className='flex gap-3 pt-1'>
                      <button
                        type='button'
                        onClick={() => { setFormOpen(false); setForm(EMPTY_FORM) }}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-3 font-semibold text-sm'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='material-open-btn'
                        type='submit'
                        disabled={saving}
                        whileTap={{ scale: 0.98 }}
                        className='flex-1 rounded-full px-4 py-3 bg-[#883bbc] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60'
                      >
                        {saving
                          ? <i className='ri-loader-4-line animate-spin text-lg'></i>
                          : <><i className='ri-add-line'></i><span>Add Material</span></>
                        }
                      </motion.button>
                    </div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminMaterial
