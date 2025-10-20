
import React, { useMemo, useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart, QrCode, Trash2, Check } from "lucide-react";
import QRCode from "qrcode";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Badge, Modal, Sheet, Tabs } from "./components/UI.jsx";

// Config
const STRUCTURE_NAME = "La Dimora del Generale";
// Endpoint fornito dall'utente
const ORDER_ENDPOINT = "https://script.google.com/macros/s/AKfycbxt_itwzG0oZP5IqT6n_uLNVvgi3v6xBGa7Qtw9yKD4dEXugvh50XrzMzTKVxdEqzuV/exec";

// Menu dal PDF
const DEFAULT_MENU = [
  { id: "caffetteria", name: "Caffetteria", items: [
    { id: "espresso", name: "Caffè Espresso", price: 1.5, desc: "Espresso italiano intenso" },
    { id: "americano", name: "Caffè Americano", price: 2.0, desc: "Lungo e leggero" },
    { id: "cappuccino", name: "Cappuccino", price: 2.5, desc: "Espresso e latte montato" },
    { id: "deca", name: "Caffè Deca", price: 2.5, desc: "Espresso italiano senza caffeina" },
    { id: "latte-macchiato", name: "Latte Macchiato", price: 2.0, desc: "Latte con un tocco di espresso" },
    { id: "latte-bianco", name: "Latte Bianco", price: 1.5, desc: "Semplice e genuino" },
    { id: "latte-soia", name: "Latte Di Soia", price: 2.5, desc: "Versatile e neutro" },
    { id: "latte-nocciola", name: "Latte Di Nocciola", price: 2.5, desc: "Goloso e ricco" },
    { id: "latte-cocco", name: "Latte Di Cocco", price: 3.5, desc: "Dolce ed esotico" },
  ]},
  { id: "gli-speciali", name: "Gli Speciali", items: [
    { id: "menu-standard", name: "Menu standard", price: 8.0, desc: "1 scelta di caffetteria + 3 scelte diverse Dolce/Salato" },
    { id: "colazione-del-generale", name: "Colazione Del Generale", price: 15.0, desc: "1 bevanda a scelta e 1 caffè. Bacon, Uova, Formaggio, Pomodori e crostata inclusa" },
    { id: "sorsi-mandorla", name: "Sorsi di Mandorla", price: 3.5, desc: "Caffè intenso, dolcezza di mandorla" },
  ]},
  { id: "dolce-salato", name: "Dolce e Salato", items: [
    { id: "uova-strapazzate", name: "Uova Strapazzate", price: 3.0, desc: "Sempre fresche" },
    { id: "bacon-croccante", name: "Bacon Croccante", price: 4.0, desc: "Fette super croccanti" },
    { id: "formaggio", name: "Formaggio", price: 3.5, desc: "Tipico e Locale" },
    { id: "pomodori", name: "Pomodori", price: 2.0, desc: "Semplici e genuini" },
    { id: "cornetto", name: "Cornetto", price: 1.5, desc: "Vuoto o ripieno" },
    { id: "crostata-nonna", name: "Crostata della Nonna", price: 3.5, desc: "Fresca e variabile di gusto" },
    { id: "ciambellone", name: "Ciambellone Fresco", price: 3.5, desc: "Soffice e gustoso" },
    { id: "cereali", name: "Cereali", price: 3.5, desc: "Ciotola di croccantezza" },
  ]},
  { id: "caffetteria-extra", name: "Caffetteria Extra", items: [
    { id: "latte-senza-lattosio", name: "Latte Senza Lattosio", price: 2.5, desc: "Leggero e digeribile" },
  ]},
  { id: "freddi", name: "Da Bere Freddo", items: [
    { id: "latte-mandorla", name: "Latte di Mandorla", price: 2.0, desc: "Dolce mediterraneo" },
    { id: "spremuta", name: "Spremuta", price: 4.0, desc: "Vitamina C pura" },
    { id: "succo-frutta", name: "Succo di Frutta", price: 2.5, desc: "Ananas, ACE, Arancia" },
  ]},
];

function formatPrice(n){ return n.toLocaleString('it-IT',{style:'currency',currency:'EUR'}) }

function useLocalStorage(key, initial){
  const [v,setV] = useState(()=>{
    try { const s = localStorage.getItem(key); return s?JSON.parse(s):initial } catch { return initial }
  })
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(v)) }catch{} }, [key,v])
  return [v,setV]
}

function QRPreview({ url }){
  const [dataUrl,setDataUrl] = useState('')
  useEffect(()=>{
    if(!url) return;
    QRCode.toDataURL(url, {width: 512, margin: 2}).then(setDataUrl).catch(()=>setDataUrl(''))
  },[url])
  if(!url) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl ? <img src={dataUrl} className="w-48 h-48" /> : <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-2xl" />}
      <div className="text-xs text-gray-500 break-all text-center max-w-[22rem]">{url}</div>
    </div>
  )
}

export default function App(){
  const [guestName, setGuestName] = useLocalStorage('ldg_guestName','')
  const [room, setRoom] = useLocalStorage('ldg_room','')
  const [notes, setNotes] = useState('')
  const [menu, setMenu] = useLocalStorage('ldg_menu', DEFAULT_MENU)
  const [cart, setCart] = useLocalStorage('ldg_cart', {})
  const [showQR, setShowQR] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [justSent, setJustSent] = useState(false)

  const total = useMemo(()=>Object.entries(cart).reduce((sum,[id,qty])=>{
    for(const cat of menu){ const it = cat.items.find(i=>i.id===id); if(it) return sum + it.price*qty }
    return sum
  },0),[cart,menu])

  function addToCart(id){ setCart(c => ({...c, [id]:(c[id]||0)+1})) }
  function removeFromCart(id){ setCart(c => { const q=(c[id]||0)-1; const n={...c}; if(q<=0) delete n[id]; else n[id]=q; return n }) }
  function clearCart(){ setCart({}) }
  function itemById(id){ for(const cat of menu){ const it=cat.items.find(i=>i.id===id); if(it) return it } return null }

  async function submitOrder(){
  const payload = {
    structure: STRUCTURE_NAME,
    when: new Date().toISOString(),
    room: room?.trim() || null,
    guestName: guestName?.trim() || null,
    notes: notes?.trim() || null,
    items: Object.entries(cart).map(([id, qty]) => ({ id, qty })),
    total,
    source: typeof window !== "undefined" ? window.location.href : ""
  }

  if (!payload.items.length) {
    alert("Carrello vuoto. Aggiungi almeno un prodotto.");
    return;
  }

  try {
    const res = await fetch(ORDER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Invio fallito");
    setShowReceipt(true);
    setJustSent(true);
    clearCart();
  } catch (e) {
    alert("Errore: non è stato possibile inviare l'ordine. Controlla l'endpoint.");
  }
}

  const currentUrl = typeof window!=='undefined' ? window.location.href : ''

  const tabs = menu.map(m=>({id:m.id, name:m.name}))
  const [activeTab, setActiveTab] = useState(tabs[0]?.id||'')

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">La Dimora del Generale</h1>
          <p className="text-sm text-gray-500">Menu & Ordini via QR</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={()=>setShowQR(true)} className="flex items-center gap-2"><QrCode size={16}/>QR della pagina</Button>
          <Button onClick={()=>setShowCart(true)} className="flex items-center gap-2"><ShoppingCart size={16}/>Carrello ({Object.keys(cart).length})</Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {menu.filter(m=>m.id===activeTab).map(cat => (
        <div key={cat.id} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cat.items.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge>{formatPrice(item.price)}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={()=>addToCart(item.id)}><Plus size={16} className="inline mr-2"/>Aggiungi</Button>
                  {cart[item.id] ? <Button variant="outline" onClick={()=>removeFromCart(item.id)}><Minus size={16} className="inline mr-2"/>Togli</Button> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {/* QR Modal */}
      <Modal open={showQR} onClose={()=>setShowQR(false)} title="Stampa il QR">
        <div className="flex flex-col items-center gap-3">
          <QRPreview url={currentUrl} />
          <p className="text-xs text-gray-500 text-center">Tasto destro → salva immagine per stamparla e metterla in camera.</p>
        </div>
      </Modal>

      {/* Cart Sheet */}
      <Sheet open={showCart} onClose={()=>setShowCart(false)} title="Il tuo ordine">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Nome ospite (opzionale)" value={guestName} onChange={e=>setGuestName(e.target.value)} />
            <Input placeholder="Camera/Tavolo" value={room} onChange={e=>setRoom(e.target.value)} />
          </div>
          <Textarea placeholder="Note per la cucina/servizio (es. intolleranze)" value={notes} onChange={e=>setNotes(e.target.value)} />
          <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
            {Object.entries(cart).length===0 && <p className="text-sm text-gray-500">Il carrello è vuoto.</p>}
            {Object.entries(cart).map(([id, qty])=>{
              const it = itemById(id); if(!it) return null;
              return (
                <Card key={id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">{formatPrice(it.price)} • {it.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={()=>removeFromCart(id)}>-</Button>
                      <div className="w-8 text-center">{qty}</div>
                      <Button onClick={()=>addToCart(id)}>+</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-gray-500">Totale</div>
            <div className="text-lg font-semibold">{formatPrice(total)}</div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={submitOrder}><Check size={16} className="inline mr-2" />Invia ordine</Button>
            <Button variant="outline" onClick={clearCart}><Trash2 size={16} className="inline mr-2" />Svuota</Button>
          </div>
        </div>
      </Sheet>

      {/* Receipt */}
      <Modal open={showReceipt} onClose={()=>setShowReceipt(false)} title="Riepilogo ordine">
        <div className="text-sm space-y-2">
          <div><strong>Struttura:</strong> {STRUCTURE_NAME}</div>
          {room && <div><strong>Camera/Tavolo:</strong> {room}</div>}
          {guestName && <div><strong>Ospite:</strong> {guestName}</div>}
          {notes && <div><strong>Note:</strong> {notes}</div>}
          <div className="pt-2 border-t" />
          <div className="space-y-1">
            {Object.entries(cart).map(([id, qty])=>{
              const it = itemById(id); if(!it) return null;
              return <div key={id} className="flex justify-between"><span>{qty}× {it.name}</span><span>{formatPrice(qty*it.price)}</span></div>
            })}
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Totale</span><span>{formatPrice(total)}</span>
          </div>
          {justSent && <p className="text-xs text-gray-500 pt-2">Ordine inviato! Controlla Google Sheets.</p>}
        </div>
      </Modal>

      <footer className="max-w-5xl mx-auto mt-10 text-center text-xs text-gray-500">
        Suggerimento: pubblica questa pagina su Vercel, poi stampa il QR dalla testata.
      </footer>
    </div>
  )
}
