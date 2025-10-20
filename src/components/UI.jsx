import React from 'react'

export const Card = ({children}) => (
  <div className="bg-white rounded-2xl border shadow-sm">{children}</div>
);
export const CardHeader = ({children}) => (
  <div className="p-4 border-b">{children}</div>
);
export const CardTitle = ({children}) => (
  <div className="text-lg font-semibold">{children}</div>
);
export const CardContent = ({children}) => (
  <div className="p-4">{children}</div>
);

export const Button = ({children, onClick, variant='primary', className='', ...props}) => {
  const base = variant==='outline'
    ? 'border border-gray-300 text-gray-800 bg-white hover:bg-gray-50'
    : 'bg-emerald-600 text-white hover:bg-emerald-700';
  return <button onClick={onClick} className={`px-3 py-2 rounded-xl text-sm transition ${base} ${className}`} {...props}>{children}</button>
}

export const Input = (props) => <input {...props} className={`w-full px-3 py-2 rounded-xl border border-gray-300 ${props.className||''}`} />
export const Textarea = (props) => <textarea {...props} className={`w-full px-3 py-2 rounded-xl border border-gray-300 ${props.className||''}`} />

export const Badge = ({children}) => (
  <span className="text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-1">{children}</span>
)

export const Modal = ({open, onClose, title, children}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Sheet = ({open, onClose, title, children}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Tabs = ({tabs, active, onChange}) => (
  <div>
    <div className="flex flex-wrap gap-2 mb-3">
      {tabs.map(t => (
        <button key={t.id} className={`px-3 py-1 rounded-full text-sm border ${active===t.id?'bg-emerald-600 text-white border-emerald-600':'bg-white'}`} onClick={()=>onChange(t.id)}>{t.name}</button>
      ))}
    </div>
  </div>
)
