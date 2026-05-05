import React, { useState, useEffect } from "react";

// ── SUPABASE CONFIG ──
const SUPABASE_URL = "https://ecsaqrneylxstqbxxjkz.supabase.co";
const SUPABASE_KEY = "sb_publishable_HdCUJNpHMLQ6hWCDjK1zqA_cAhEcZr8";

async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) { const e = await res.text(); throw new Error(e); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  getLeads: () => sbFetch("cadastros?order=created_at.asc&select=*"),
  insertLead: (data) => sbFetch("cadastros", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id, data) => sbFetch("cadastros?id=eq." + id, { method: "PATCH", body: JSON.stringify(data) }),
  getContas: () => sbFetch("contas_rev?select=*"),
  insertConta: (data) => sbFetch("contas_rev", { method: "POST", body: JSON.stringify(data) }),
};

const AZUL="#0057A8",AZUL_ESC="#003E7A",AZUL_CL="#E8F1FB",VERMELHO="#C8102E",BRANCO="#FFFFFF",OFF="#F7F9FC",BORDA="#DDE4EF",TEXTO="#1A2535",SUB="#5C6F88",SUB2="#8FA3BB";
const META_TOTAL=360,SENHA_GDE="gde2026",SENHA_MRA="mra2026";

const STATUS_COR={"Novos Cadastros":"#f59e0b","Em Processo de Integração":"#0284C7","Integração Realizada":"#0369a1","Aguardando Início":"#7C3AED","Em Execução":"#16a34a","Finalizado":"#475569","Não Integrado":"#DC2626","Cancelado":"#C8102E"};

const CONSULTORES=["FERNANDO SOUSA","RODRIGO BUREGIO DE MIRANDA MARQUES","ANDRE FELIPE ARAUJO LIRA","ARTEMILTON DE CASTRO BEZERRA","JULIO CESAR HONORATO BRITO","JESSICA PAMILA DOS SANTOS","JEAN NOBREGA DA SILVA","REGINALDO NUNES MOTA","LINCOLN MARCELINO COSTA DA CUNHA","RICARDO FERNANDO PEREIRA","WELLINGTON RIBEIRO PEREIRA","FABIO COSTA -PA","JOSE DA SILVA JUNIOR","MARCELO YOSHIYUKI TEIXEIRA OKADA","MARCOS TARDELLI OLIVEIRA DE SOUSA","FAISTTON FRANCISCO DIAS FARIAS","ANTONIO FREITAS BASTOS NETO","ORLANDO CORDEIRO DA ROCHA NETTO","EWERTON SILVA DE JESUS","ROBERT CUNHA DE ARAUJO","EDUARDO CARVALHO FERNANDES","GIOVANE BONACIN","Outros"];

const ETAPAS=[
  {id:"Novos Cadastros",         label:"Novos Cadastros",       cor:"#f59e0b",icon:"⏳",resp:"Comercial",          acao:"Iniciar Integração",       prox:"Em Processo de Integração"},
  {id:"Em Processo de Integração",label:"Em Processo de Integração",cor:"#0284C7",icon:"🔧",resp:"Integração Técnica",acao:"Concluir Integração",      prox:"Integração Realizada"},
  {id:"Integração Realizada",    label:"Integração Realizada",  cor:"#0369a1",icon:"✅",resp:"Integração Técnica",acao:"Confirmar para Agenda",     prox:"Aguardando Início"},
  {id:"Aguardando Início",       label:"Aguardando Início",     cor:"#7C3AED",icon:"📅",resp:"Agenda MRA",         acao:"Iniciar Execução",          prox:"Em Execução"},
  {id:"Em Execução",             label:"Em Execução",           cor:"#16a34a",icon:"👁️",resp:"Monitoramento",      acao:"Finalizar",                 prox:"Finalizado"},
  {id:"Finalizado",              label:"Finalizado",            cor:"#475569",icon:"🏁",resp:"Agenda MRA",         acao:null,                        prox:null},
];

// Map between app state and DB columns
function mapToDB(l) {
  return {
    id: typeof l.id === "number" && l.id > 1000000000 ? undefined : l.id,
    email_rev: l.emailRev||"",
    nome_posto: l.nomePosto||"", razao_social: l.cnpj||"", cidade: l.cidade||"", estado: l.estado||"",
    responsavel: l.responsavel||"", telefone: l.telefone||"",
    is_rede: l.isRede||false, nome_rede: l.nomeRede||"", qtd_postos_rede: l.qtdPostosRede||"",
    consultor: l.consultor||"", consultor_outros: l.consultorOutros||"",
    nome_ti: l.nomeTI||"", cargo_ti: l.cargoTI||"", wpp_ti: l.wppTI||"", email_ti: l.emailTI||"",
    marca_dvr: l.marcaDVR||"", marca_dvr_outro: l.marcaDVROutro||"", tipo_acesso: l.tipoAcesso||"",
    ip_ddns: l.ipDDNS||"", porta: l.porta||"", usuario_dvr: l.usuarioDVR||"", senha_dvr: l.senhaDVR||"",
    serial_p2p: l.serialP2P||"", usuario_p2p: l.usuarioP2P||"", senha_p2p: l.senhaP2P||"", app_p2p: l.appP2P||"",
    status: l.status||"Novos Cadastros", justificativa: l.justificativa||"",
  };
}

function mapFromDB(r) {
  return {
    id: r.id, ts: r.created_at, emailRev: r.email_rev||"",
    nomePosto: r.nome_posto||"", cnpj: r.razao_social||"", cidade: r.cidade||"", estado: r.estado||"",
    responsavel: r.responsavel||"", telefone: r.telefone||"",
    isRede: r.is_rede||false, nomeRede: r.nome_rede||"", qtdPostosRede: r.qtd_postos_rede||"",
    consultor: r.consultor||"", consultorOutros: r.consultor_outros||"",
    nomeTI: r.nome_ti||"", cargoTI: r.cargo_ti||"", wppTI: r.wpp_ti||"", emailTI: r.email_ti||"",
    marcaDVR: r.marca_dvr||"", marcaDVROutro: r.marca_dvr_outro||"", tipoAcesso: r.tipo_acesso||"",
    ipDDNS: r.ip_ddns||"", porta: r.porta||"", usuarioDVR: r.usuario_dvr||"", senhaDVR: r.senha_dvr||"",
    serialP2P: r.serial_p2p||"", usuarioP2P: r.usuario_p2p||"", senhaP2P: r.senha_p2p||"", appP2P: r.app_p2p||"",
    status: r.status||"Novos Cadastros", justificativa: r.justificativa||"",
    marcaDVROutro: r.marca_dvr_outro||"", anexo: null,
  };
}

const LEADS0=[
  {id:1,ts:"2026-04-20T10:30:00",nomePosto:"Auto Posto Fortaleza",cnpj:"07.526.557/0001-00",cidade:"Fortaleza",estado:"CE",responsavel:"Jorge Alves",telefone:"(85)99201-1111",consultor:"JULIO CESAR HONORATO BRITO",isRede:false,nomeRede:"",qtdPostosRede:"",nomeTI:"Paulo Tech",wppTI:"(85)99100-2222",marcaDVR:"Intelbras",marcaDVROutro:"",tipoAcesso:"IP/DDNS",ipDDNS:"189.45.1.1",porta:"8000",usuarioDVR:"admin",senhaDVR:"1234",serialP2P:"",usuarioP2P:"",senhaP2P:"",appP2P:"",internet:"Fibra óptica",provedor:"Vivo",obs:"",status:"Novos Cadastros",justificativa:""},
  {id:2,ts:"2026-04-21T14:15:00",nomePosto:"Posto Sol Nascente",cnpj:"12.345.678/0001-99",cidade:"Recife",estado:"PE",responsavel:"Maria Santos",telefone:"(81)98802-3333",consultor:"FERNANDO SOUSA",isRede:true,nomeRede:"Grupo Sol",qtdPostosRede:"5 a 10 postos",nomeTI:"TI Recife",wppTI:"(81)97700-4444",marcaDVR:"Hikvision",marcaDVROutro:"",tipoAcesso:"P2P (App)",ipDDNS:"",porta:"",usuarioDVR:"",senhaDVR:"",serialP2P:"ABC123456",usuarioP2P:"admin",senhaP2P:"1234",appP2P:"Hik-Connect",internet:"Fibra óptica",provedor:"Claro",obs:"",status:"Em Processo de Integração",justificativa:""},
  {id:3,ts:"2026-04-22T09:00:00",nomePosto:"Posto São Luís Centro",cnpj:"23.456.789/0001-11",cidade:"São Luís",estado:"MA",responsavel:"Felipe Costa",telefone:"(98)99503-5555",consultor:"RODRIGO BUREGIO DE MIRANDA MARQUES",isRede:false,nomeRede:"",qtdPostosRede:"",nomeTI:"TI Maranhão",wppTI:"(98)98800-6666",marcaDVR:"Dahua",marcaDVROutro:"",tipoAcesso:"IP/DDNS",ipDDNS:"192.168.1.1",porta:"9000",usuarioDVR:"admin",senhaDVR:"0000",serialP2P:"",usuarioP2P:"",senhaP2P:"",appP2P:"",internet:"Rádio",provedor:"Local Telecom",obs:"Sistema antigo",status:"Aguardando Início",justificativa:""},
  {id:4,ts:"2026-04-23T16:45:00",nomePosto:"Posto Boa Vista",cnpj:"34.567.890/0001-22",cidade:"Manaus",estado:"AM",responsavel:"Cláudia Neves",telefone:"(92)99104-7777",consultor:"FERNANDO SOUSA",isRede:false,nomeRede:"",qtdPostosRede:"",nomeTI:"Augusto TI",wppTI:"(92)99200-8888",marcaDVR:"Intelbras",marcaDVROutro:"",tipoAcesso:"IP/DDNS",ipDDNS:"200.10.1.5",porta:"8000",usuarioDVR:"admin",senhaDVR:"admin",serialP2P:"",usuarioP2P:"",senhaP2P:"",appP2P:"",internet:"Fibra óptica",provedor:"Vivo",obs:"",status:"Em Execução",justificativa:""},
  {id:5,ts:"2026-04-24T11:20:00",nomePosto:"Auto Posto Belém Norte",cnpj:"45.678.901/0001-33",cidade:"Belém",estado:"PA",responsavel:"Roberto Matos",telefone:"(91)98605-9999",consultor:"ANDRE FELIPE ARAUJO LIRA",isRede:true,nomeRede:"Rede Norte",qtdPostosRede:"11 a 29 postos",nomeTI:"TI Pará",wppTI:"(91)99300-0000",marcaDVR:"Giga Security",marcaDVROutro:"",tipoAcesso:"P2P (App)",ipDDNS:"",porta:"",usuarioDVR:"",senhaDVR:"",serialP2P:"GDE999888",usuarioP2P:"admin",senhaP2P:"1111",appP2P:"DMSS",internet:"Fibra óptica",provedor:"TIM",obs:"",status:"Novos Cadastros",justificativa:""},
];

const FD0={nomePosto:"",cnpj:"",cidade:"",estado:"",responsavel:"",telefone:"",consultor:"",consultorOutros:"",isRede:"nao",nomeRede:"",qtdPostosRede:"",nomeTI:"",cargoTI:"",wppTI:"",emailTI:"",marcaDVR:"",marcaDVROutro:"",tipoAcesso:"",ipDDNS:"",porta:"",usuarioDVR:"",senhaDVR:"",serialP2P:"",usuarioP2P:"",senhaP2P:"",appP2P:"",internet:"",provedor:"",obs:"",anexo:null};

const fmtD=(ts)=>new Date(ts).toLocaleDateString("pt-BR");
const fmtH=(ts)=>new Date(ts).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const fmtM=(ts)=>new Date(ts).toLocaleString("pt-BR",{month:"long",year:"numeric"});

const Inp=({ph,val,fn,type="text",req=false})=><input type={type} placeholder={ph} value={val} onChange={e=>fn(e.target.value)} required={req} style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:TEXTO,background:OFF,outline:"none"}}/>;
const Sel=({opts,val,fn,ph})=><select value={val} onChange={e=>fn(e.target.value)} style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:val?TEXTO:SUB2,background:OFF,outline:"none",cursor:"pointer"}}><option value="">{ph}</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
const Lbl=({t,req=false})=><div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:TEXTO,marginBottom:4}}>{t}{req&&<span style={{color:VERMELHO}}> *</span>}</div>;
const FSec=({icon,txt})=><div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,letterSpacing:2.5,textTransform:"uppercase",color:AZUL,paddingBottom:8,borderBottom:"2px solid "+AZUL_CL,marginBottom:16,marginTop:28,display:"flex",alignItems:"center",gap:6}}>{icon} {txt}</div>;
const G2=({children})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>;
const Radio=({name,val,cur,fn,label})=><label style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",border:"1.5px solid "+(cur===val?AZUL:BORDA),borderRadius:2,cursor:"pointer",fontSize:13,fontFamily:"Open Sans,sans-serif",background:cur===val?AZUL_CL:OFF,color:cur===val?AZUL_ESC:TEXTO,fontWeight:cur===val?600:400}}><input type="radio" name={name} value={val} checked={cur===val} onChange={()=>fn(val)} style={{display:"none"}}/>{label}</label>;
const AccBtn=({open})=><div style={{width:28,height:28,borderRadius:"50%",background:open?AZUL:OFF,border:"1.5px solid "+(open?AZUL:BORDA),display:"flex",alignItems:"center",justifyContent:"center",color:open?BRANCO:SUB,fontWeight:900,fontSize:18,lineHeight:1,flexShrink:0}}>{open?"−":"+"}</div>;

export default function App() {
  const [tela,setTela]=useState("landing");
  const [leads,setLeadsRaw]=useState(LEADS0);
  const [ok,setOk]=useState(false);
  const [loginTela,setLoginTela]=useState(null);
  const [loginSenha,setLoginSenha]=useState("");
  const [loginEmail,setLoginEmail]=useState("");
  const [loginErro,setLoginErro]=useState(false);
  const [fd,setFD]=useState(FD0);
  const [accF,setAccF]=useState(false);
  const [accQ,setAccQ]=useState(false);
  const [leadSel,setLeadSel]=useState(null);
  const [filtroCons,setFiltroCons]=useState("todos");
  const [filtroSt,setFiltroSt]=useState("todos");
  const [abaGDE,setAbaGDE]=useState("projeto");
  const [abaMRA,setAbaMRA]=useState("funil");
  const [dragId,setDragId]=useState(null);
  const [modalNI,setModalNI]=useState(null);
  const [just,setJust]=useState("");
  const [acc,setAcc]=useState({ag:false,proc:false,int:false,int2:false,intag:false,ativo:false,conc:false,naoInt:false,todos:false});
  const [carregado,setCarregado]=useState(false);
  // Revendedor login
  const [revEmail,setRevEmail]=useState("");
  const [revSenha,setRevSenha]=useState("");
  const [revSenhaConf,setRevSenhaConf]=useState("");
  const [revLogado,setRevLogado]=useState(null); // { email, nome, isRede, nomeRede }
  const [revErro,setRevErro]=useState("");
  const [revModo,setRevModo]=useState("login"); // "login" | "cadastrar"
  const [editandoId,setEditandoId]=useState(null);
  const [abaPainel,setAbaPainel]=useState("meus"); // "meus" | "novo"
  const [contas,setContasRaw]=useState([]);
  const [maisUmPosto,setMaisUmPosto]=useState(false);

  useEffect(()=>{
    Promise.all([
      db.getLeads().catch(()=>[]),
      db.getContas().catch(()=>[]),
    ]).then(([leads, contas])=>{
      if(leads && leads.length) setLeadsRaw(leads.map(mapFromDB));
      if(contas && contas.length) setContasRaw(contas);
      setCarregado(true);
    }).catch(()=>setCarregado(true));
  },[]);

  const setContas=(upd)=>{
    setContasRaw(prev=>{
      const next=typeof upd==="function"?upd(prev):upd;
      // Insert new accounts to Supabase
      const prevEmails=new Set(prev.map(c=>c.email));
      next.filter(c=>!prevEmails.has(c.email)).forEach(c=>db.insertConta({email:c.email,senha:c.senha}).catch(()=>{}));
      return next;
    });
  };

  const setLeads=(upd)=>{
    setLeadsRaw(prev=>{
      const next=typeof upd==="function"?upd(prev):upd;
      const prevIds=new Set(prev.map(l=>l.id));
      next.filter(l=>!prevIds.has(l.id)).forEach(l=>db.insertLead(mapToDB(l)).catch(()=>{}));
      next.filter(l=>prevIds.has(l.id)&&JSON.stringify(l)!==JSON.stringify(prev.find(p=>p.id===l.id))).forEach(l=>db.updateLead(l.id,mapToDB(l)).catch(()=>{}));
      return next;
    });
  };

  const h=(k,v)=>setFD(p=>({...p,[k]:v}));
  const tAcc=(k)=>setAcc(p=>({...p,[k]:!p[k]}));

  const doLogin=()=>{
    if(loginTela==="gde"&&loginSenha===SENHA_GDE){setTela("gde");setLoginTela(null);setLoginSenha("");}
    else if(loginTela==="mra"&&loginSenha===SENHA_MRA){setTela("mra");setLoginTela(null);setLoginSenha("");}
    else if(loginTela==="rev"){
      const conta=contas.find(c=>c.email.toLowerCase()===loginEmail.toLowerCase()&&c.senha===loginSenha);
      if(conta){setRevLogado(conta);setTela("revendedor");setLoginTela(null);setLoginEmail("");setLoginSenha("");setRevErro("");}
      else setRevErro("E-mail ou senha incorretos.");
    }
    else setLoginErro(true);
  };

  const criarConta=()=>{
    if(!revEmail.trim()||!revSenha.trim()){setRevErro("Preencha e-mail e senha.");return;}
    if(revSenha!==revSenhaConf){setRevErro("As senhas não coincidem.");return;}
    if(revSenha.length<6){setRevErro("A senha deve ter pelo menos 6 caracteres.");return;}
    if(contas.find(c=>c.email.toLowerCase()===revEmail.toLowerCase())){setRevErro("Este e-mail já possui uma conta.");return;}
    const nova={email:revEmail.trim().toLowerCase(),senha:revSenha,nome:"",criadoEm:new Date().toISOString()};
    setContas(p=>[...p,nova]);
    setRevLogado(nova);setTela("revendedor");setLoginTela(null);setRevEmail("");setRevSenha("");setRevSenhaConf("");setRevErro("");
  };

  const submit=(e)=>{
    e.preventDefault();
    setLeads(p=>[...p,{...fd,id:Date.now(),ts:new Date().toISOString(),status:"Novos Cadastros",isRede:fd.isRede==="sim",justificativa:"",emailRev:""}]);
    setOk(true);window.scrollTo({top:0,behavior:"smooth"});
  };

  const mover=(lead,novoStatus)=>setLeads(p=>p.map(l=>l.id===lead.id?{...l,status:novoStatus}:l));

  const confirmarMover=(l,etapa)=>{
    const idxA=ETAPAS.findIndex(e=>e.id===l.status);
    const idxD=ETAPAS.findIndex(e=>e.id===etapa.id);
    if(idxA===idxD)return;
    const avancando=idxD===idxA+1;
    const nomeA=ETAPAS[idxA]?ETAPAS[idxA].label:l.status;
    let msg="";
    if(avancando) msg="Mover "+l.nomePosto+" para "+etapa.label+"? Esta e a proxima etapa.";
    else if(idxD<idxA) msg="ATENCAO: Retroceder "+l.nomePosto+" de "+nomeA+" para "+etapa.label+". Tem certeza?";
    else msg="ATENCAO: Avancar "+l.nomePosto+" fora da ordem de "+nomeA+" para "+etapa.label+". Altera prioridade da fila. Tem certeza?";
    if(window.confirm(msg))mover(l,etapa.id);
  };

  const confirmarAvancar=(l,prox)=>{
    const e=ETAPAS.find(x=>x.id===prox);
    const label=e?e.label:prox;
    if(window.confirm("Confirmar: mover "+l.nomePosto+" para "+label+"?"))mover(l,prox);
  };

  const porCons=CONSULTORES.slice(0,-1).map(c=>({nome:c,count:leads.filter(l=>l.consultor===c).length})).sort((a,b)=>b.count-a.count);
  const leadsOrd=[...leads].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime());
  const posG=(id)=>leadsOrd.findIndex(l=>l.id===id)+1;
  const maxC=Math.max(...porCons.map(c=>c.count),1);
  const filtrados=leads.filter(l=>(filtroCons==="todos"||l.consultor===filtroCons)&&(filtroSt==="todos"||l.status===filtroSt));

  const lAg=leads.filter(l=>l.status==="Novos Cadastros");
  const lProc=leads.filter(l=>l.status==="Em Processo de Integração");
  const lInt=leads.filter(l=>l.status==="Integração Realizada");
  const lIntAg=leads.filter(l=>l.status==="Aguardando Início");
  const lAtivo=leads.filter(l=>l.status==="Em Execução");
  const lConc=leads.filter(l=>l.status==="Finalizado");
  const lNaoInt=leads.filter(l=>l.status==="Não Integrado");
  const engajados=porCons.filter(c=>c.count>0);
  const naoEng=porCons.filter(c=>c.count===0);

  if(!carregado)return<div style={{minHeight:"100vh",background:AZUL_ESC,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}><div style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:24,color:BRANCO}}>DISLUB <span style={{color:VERMELHO}}>EQUADOR</span></div><div style={{fontSize:13,color:"rgba(255,255,255,.6)"}}>Carregando...</div></div>;

  if(loginTela)return(
    <div style={{minHeight:"100vh",background:AZUL_ESC,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:BRANCO,borderRadius:4,padding:40,width:"100%",maxWidth:380,textAlign:"center",borderTop:"4px solid "+(loginTela==="rev"?VERMELHO:loginTela==="gde"?AZUL:VERMELHO)}}>
        
        {/* LOGIN GDE / MRA */}
        {loginTela!=="rev"&&<>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:loginTela==="gde"?AZUL:VERMELHO,marginBottom:8}}>{loginTela==="gde"?"Painel GDE":"Painel MRA"}</div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:20,fontWeight:900,color:TEXTO,marginBottom:24}}>Acesso Restrito</div>
          <input type="password" placeholder="Senha de acesso" value={loginSenha} onChange={e=>{setLoginSenha(e.target.value);setLoginErro(false);}} onKeyDown={e=>e.key==="Enter"&&doLogin()}
            style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+(loginErro?VERMELHO:BORDA),borderRadius:2,fontSize:14,fontFamily:"Open Sans,sans-serif",outline:"none",marginBottom:8}}/>
          {loginErro&&<div style={{fontSize:12,color:VERMELHO,marginBottom:8}}>Senha incorreta.</div>}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>{setLoginTela(null);setLoginSenha("");setLoginErro(false);}} style={{flex:1,padding:10,border:"1px solid "+BORDA,borderRadius:2,background:"transparent",color:SUB,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Voltar</button>
            <button onClick={doLogin} style={{flex:2,padding:10,border:"none",borderRadius:2,background:loginTela==="gde"?AZUL:VERMELHO,color:BRANCO,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>Entrar</button>
          </div>
        </>}

        {/* LOGIN REVENDEDOR */}
        {loginTela==="rev"&&<>
          <div style={{fontSize:28,marginBottom:12}}>🔑</div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:AZUL,marginBottom:4}}>Área do Revendedor</div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:900,color:TEXTO,marginBottom:6}}>{revModo==="login"?"Entrar na sua conta":"Criar sua conta"}</div>
          <div style={{fontSize:12,color:SUB2,marginBottom:24}}>{revModo==="login"?"Acesse e gerencie seus postos cadastrados":"Cadastre-se para gerenciar seus postos"}</div>

          {/* ABAS LOGIN / CADASTRAR */}
          <div style={{display:"flex",border:"1px solid "+BORDA,borderRadius:4,overflow:"hidden",marginBottom:20}}>
            {[["login","Já tenho conta"],["cadastrar","Primeira vez"]].map(([m,l])=>(
              <div key={m} onClick={()=>{setRevModo(m);setRevErro("");}} style={{flex:1,padding:"9px",cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,textAlign:"center",background:revModo===m?AZUL:BRANCO,color:revModo===m?BRANCO:SUB,transition:"all .15s"}}>{l}</div>
            ))}
          </div>

          <input type="email" placeholder="Seu e-mail" value={loginEmail} onChange={e=>{setLoginEmail(e.target.value);setRevErro("");}}
            style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none",marginBottom:10}}/>
          <input type="password" placeholder="Senha" value={loginSenha} onChange={e=>{setLoginSenha(e.target.value);setRevErro("");}} onKeyDown={e=>e.key==="Enter"&&(revModo==="login"?doLogin():criarConta())}
            style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none",marginBottom:revModo==="cadastrar"?10:0}}/>
          {revModo==="cadastrar"&&<input type="password" placeholder="Confirmar senha" value={revSenhaConf} onChange={e=>{setRevSenhaConf(e.target.value);setRevErro("");}} onKeyDown={e=>e.key==="Enter"&&criarConta()}
            style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none"}}/>}

          {revErro&&<div style={{fontSize:12,color:VERMELHO,marginTop:8,padding:"8px 12px",background:"#FFF5F5",borderRadius:2,border:"1px solid #FECACA"}}>{revErro}</div>}

          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>{setLoginTela(null);setLoginEmail("");setLoginSenha("");setRevSenhaConf("");setRevErro("");}} style={{flex:1,padding:10,border:"1px solid "+BORDA,borderRadius:2,background:"transparent",color:SUB,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Voltar</button>
            <button onClick={revModo==="login"?doLogin:criarConta} style={{flex:2,padding:10,border:"none",borderRadius:2,background:AZUL,color:BRANCO,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{revModo==="login"?"Entrar":"Criar conta"}</button>
          </div>
        </>}
      </div>
    </div>
  );

  if(tela==="gde")return(
    <div style={{fontFamily:"Open Sans,sans-serif",background:OFF,minHeight:"100vh",color:TEXTO}}>
      <div style={{background:AZUL_ESC,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:18,color:BRANCO}}>DISLUB <span style={{color:VERMELHO}}>EQUADOR</span></div>
          <div style={{width:1,height:20,background:"rgba(255,255,255,.2)"}}/>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(255,255,255,.7)"}}>Painel Gerencial · Cliente Oculto 2.0</div>
        </div>
        <button onClick={()=>setTela("landing")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.25)",color:"rgba(255,255,255,.7)",cursor:"pointer",padding:"6px 14px",borderRadius:2,fontSize:11,fontFamily:"Montserrat,sans-serif"}}>Sair</button>
      </div>
      <div style={{background:BRANCO,borderBottom:"1px solid "+BORDA,padding:"0 32px",display:"flex"}}>
        {[["equipe","👥 Performance da Equipe"],["projeto","📊 Andamento do Projeto"]].map(([id,lbl])=>(
          <div key={id} onClick={()=>setAbaGDE(id)} style={{padding:"16px 24px",cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,borderBottom:abaGDE===id?"3px solid "+AZUL:"3px solid transparent",color:abaGDE===id?AZUL:SUB,userSelect:"none"}}>{lbl}</div>
        ))}
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>

        {abaGDE==="equipe"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
            {[{l:"Total Consultores",v:CONSULTORES.length-1,c:AZUL,s:"na equipe GDE",i:"👥"},{l:"Engajados",v:engajados.length,c:"#16a34a",s:Math.round((engajados.length/(CONSULTORES.length-1))*100)+"% da equipe",i:"✅"},{l:"Sem Cadastros",v:naoEng.length,c:VERMELHO,s:"precisam de atenção",i:"⚠️"}].map((m,i)=>(
              <div key={i} style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+m.c,borderRadius:2,padding:"18px 20px"}}>
                <div style={{fontSize:22,marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"Montserrat,sans-serif",color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:11,color:SUB,fontFamily:"Montserrat,sans-serif",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{m.l}</div>
                <div style={{fontSize:11,color:SUB2}}>{m.s}</div>
              </div>
            ))}
          </div>
          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderRadius:2,padding:"20px 24px",marginBottom:20}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:1.5,color:AZUL,marginBottom:16}}>🏆 Ranking de Consultores</div>
            {engajados.length===0&&<div style={{fontSize:13,color:SUB2,textAlign:"center",padding:"20px 0"}}>Nenhum cadastro ainda.</div>}
            {engajados.map((c,i)=>(
              <div key={c.nome} style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,padding:"12px 16px",background:i===0?"#FFFBEB":OFF,border:"1px solid "+(i===0?"#FCD34D":BORDA),borderRadius:2}}>
                <div style={{width:32,height:32,borderRadius:2,background:i===0?"#F59E0B":i===1?"#9CA3AF":i===2?"#CD7C2F":AZUL_CL,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:900,color:i<3?BRANCO:AZUL,flexShrink:0}}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+"º"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontFamily:"Montserrat,sans-serif",fontWeight:700,color:TEXTO,marginBottom:4}}>{c.nome}</div>
                  <div style={{height:6,background:BORDA,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:((c.count/maxC)*100)+"%",background:i===0?"#F59E0B":AZUL,borderRadius:3}}/></div>
                </div>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:20,fontWeight:900,color:i===0?"#F59E0B":AZUL}}>{c.count}</div>
              </div>
            ))}
          </div>
          {naoEng.length>0&&<div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+VERMELHO,borderRadius:2,padding:"20px 24px"}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:1.5,color:VERMELHO,marginBottom:16}}>⚠️ Sem Nenhum Cadastro</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
              {naoEng.map(c=><div key={c.nome} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#FFF5F6",border:"1px solid #FECDD3",borderRadius:2}}><span>⚠️</span><div style={{fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:600,color:"#9F1239"}}>{c.nome}</div></div>)}
            </div>
          </div>}
        </>}

        {abaGDE==="projeto"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
            {[{l:"Novos Cadastros",v:lAg.length,c:"#f59e0b",i:"⏳"},{l:"Em Processo",v:lProc.length,c:"#0284C7",i:"🔧"},{l:"Integração Realizada",v:lInt.length,c:"#0369a1",i:"✅"},{l:"Aguardando Início",v:lIntAg.length,c:"#7C3AED",i:"📅"},{l:"Em Execução",v:lAtivo.length,c:"#16a34a",i:"👁️"},{l:"Finalizado",v:lConc.length,c:"#475569",i:"🏁"},{l:"Não Integrados",v:lNaoInt.length,c:"#DC2626",i:"⛔"}].map((m,i)=>(
              <div key={i} style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+m.c,borderRadius:2,padding:"16px 18px"}}>
                <div style={{fontSize:20,marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:26,fontWeight:800,fontFamily:"Montserrat,sans-serif",color:m.c}}>{m.v}</div>
                <div style={{fontSize:10,color:SUB,fontFamily:"Montserrat,sans-serif",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderRadius:2,padding:"20px 24px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:AZUL}}>Progresso do Contrato MRA</div>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:700}}>{leads.length} de {META_TOTAL}</div>
            </div>
            <div style={{height:14,background:AZUL_CL,borderRadius:3,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:(Math.min((leads.length/META_TOTAL)*100,100))+"%",background:AZUL,borderRadius:3}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:SUB2,marginBottom:10}}><span>Início: 01/05/2026</span><span>Término: 30/04/2027</span></div>
            <div style={{padding:"10px 14px",background:AZUL_CL,borderRadius:2,display:"flex",alignItems:"center",gap:8}}>
              <span>📋</span><span style={{fontSize:12,color:AZUL_ESC,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Regra: a ordem de integração segue a data e hora do cadastro.</span>
            </div>
          </div>

          {[
            {lista:[...lAg].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()),cor:"#f59e0b",titulo:"⏳ Novos Cadastros",tag:"Novo",tagC:"#92400E",tagB:"#FEF3C7",k:"ag"},
            {lista:[...lProc].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()),cor:"#0284C7",titulo:"🔧 Em Processo de Integração",tag:"Em andamento",tagC:"#1E40AF",tagB:"#DBEAFE",k:"proc"},
            {lista:[...lInt].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()),cor:"#0369a1",titulo:"✅ Integração Realizada",tag:"Realizada",tagC:"#075985",tagB:"#E0F2FE",k:"int2"},
            {lista:[...lIntAg].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()),cor:"#7C3AED",titulo:"📅 Aguardando Início",tag:"Aguardando",tagC:"#5B21B6",tagB:"#EDE9FE",k:"intag"},
            {lista:[...lAtivo].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()),cor:"#16a34a",titulo:"👁️ Em Execução",tag:"Em execução",tagC:"#166534",tagB:"#DCFCE7",k:"ativo"},
          ].map(s=>(
            <div key={s.k} style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+s.cor,borderRadius:2,marginBottom:12,overflow:"hidden"}}>
              <div onClick={()=>tAcc(s.k)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",cursor:"pointer",userSelect:"none",background:acc[s.k]?(s.cor+"08"):BRANCO}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:s.cor}}>{s.titulo}</div>
                  <div style={{padding:"2px 10px",borderRadius:10,background:s.cor+"22",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:900,color:s.cor}}>{s.lista.length}</div>
                </div>
                <AccBtn open={acc[s.k]}/>
              </div>
              {acc[s.k]&&<div style={{padding:"0 20px 16px"}}>
                {s.lista.length===0&&<div style={{fontSize:13,color:SUB2,padding:"12px 0"}}>Nenhum posto nesta etapa.</div>}
                {s.lista.map((l,idx)=>(
                  <div key={l.id} onClick={()=>setLeadSel(l)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",border:"1px solid "+BORDA,borderRadius:2,marginBottom:8,cursor:"pointer",background:OFF}}>
                    <div style={{width:28,height:28,borderRadius:2,background:idx===0?s.cor:s.cor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:900,color:idx===0?BRANCO:s.cor,flexShrink:0}}>{posG(l.id)}º</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,fontFamily:"Montserrat,sans-serif",color:TEXTO}}>{l.nomePosto}</div>
                      <div style={{fontSize:11,color:SUB2,marginTop:2}}>{l.cidade}/{l.estado} · {l.consultor}</div>
                    </div>
                    <div style={{fontSize:11,color:SUB2,whiteSpace:"nowrap"}}>{fmtD(l.ts)}</div>
                    <div style={{padding:"3px 10px",borderRadius:2,background:s.tagB,color:s.tagC,fontSize:10,fontWeight:700,fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>{s.tag}</div>
                  </div>
                ))}
              </div>}
            </div>
          ))}

          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid #475569",borderRadius:2,marginBottom:12,overflow:"hidden"}}>
            <div onClick={()=>tAcc("conc")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",cursor:"pointer",userSelect:"none",background:acc.conc?"#47556908":BRANCO}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:"#475569"}}>🏁 Finalizado</div>
                <div style={{padding:"2px 10px",borderRadius:10,background:"#47556922",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:900,color:"#475569"}}>{lConc.length}</div>
              </div>
              <AccBtn open={acc.conc}/>
            </div>
            {acc.conc&&<div style={{padding:"0 24px 20px"}}>
              <div style={{fontSize:12,color:SUB2,marginBottom:16}}>Ciclo completo de monitoramento realizado</div>
              {lConc.length===0&&<div style={{fontSize:13,color:SUB2}}>Nenhum posto concluído ainda.</div>}
              {lConc.length>0&&<table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:OFF}}>{["Posto","Rede","Cidade/UF","Consultor","Mês"].map(hh=><th key={hh} style={{padding:"8px 14px",textAlign:"left",fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:SUB,borderBottom:"1px solid "+BORDA,whiteSpace:"nowrap"}}>{hh}</th>)}</tr></thead>
                <tbody>{[...lConc].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()).map((l,i)=><tr key={l.id} onClick={()=>setLeadSel(l)} style={{borderBottom:"1px solid "+BORDA,cursor:"pointer",background:i%2===0?BRANCO:OFF}}>
                  <td style={{padding:"10px 14px",fontWeight:700,fontFamily:"Montserrat,sans-serif"}}>{l.nomePosto}</td>
                  <td style={{padding:"10px 14px"}}>{l.isRede?<span style={{padding:"2px 8px",borderRadius:2,background:AZUL_CL,color:AZUL,fontSize:11,fontWeight:700}}>{l.nomeRede||"Rede"}</span>:<span style={{fontSize:12,color:SUB2}}>Único</span>}</td>
                  <td style={{padding:"10px 14px",color:SUB}}>{l.cidade}/{l.estado}</td>
                  <td style={{padding:"10px 14px",color:SUB,fontSize:11}}>{l.consultor}</td>
                  <td style={{padding:"10px 14px"}}><span style={{padding:"3px 10px",borderRadius:2,background:"#F1F5F9",color:"#475569",fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif"}}>{fmtM(l.ts)}</span></td>
                </tr>)}</tbody>
              </table>}
            </div>}
          </div>

          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid #DC2626",borderRadius:2,marginBottom:12,overflow:"hidden"}}>
            <div onClick={()=>tAcc("naoInt")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",cursor:"pointer",userSelect:"none",background:acc.naoInt?"#DC262608":BRANCO}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:"#DC2626"}}>⛔ Não Integrados</div>
                <div style={{padding:"2px 10px",borderRadius:10,background:"#DC262622",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:900,color:"#DC2626"}}>{lNaoInt.length}</div>
              </div>
              <AccBtn open={acc.naoInt}/>
            </div>
            {acc.naoInt&&<div style={{padding:"0 20px 20px"}}>
              <div style={{fontSize:12,color:SUB2,marginBottom:16}}>Problema técnico no CFTV — histórico de justificativas</div>
              {lNaoInt.length===0&&<div style={{fontSize:13,color:SUB2}}>Nenhum registro.</div>}
              {lNaoInt.map(l=><div key={l.id} onClick={()=>setLeadSel(l)} style={{padding:"12px 16px",border:"1px solid #FECACA",borderRadius:2,marginBottom:8,cursor:"pointer",background:"#FFF5F5"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontWeight:700,fontFamily:"Montserrat,sans-serif",fontSize:13,color:TEXTO}}>{l.nomePosto}</div><div style={{fontSize:11,color:SUB2}}>{fmtD(l.ts)}</div></div>
                <div style={{fontSize:11,color:SUB2,marginBottom:6}}>{l.cidade}/{l.estado} · {l.consultor}</div>
                {l.justificativa&&<div style={{background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:2,padding:"8px 12px",fontSize:12,color:"#991B1B",fontStyle:"italic"}}>📝 {l.justificativa}</div>}
              </div>)}
            </div>}
          </div>

          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+AZUL,borderRadius:2,overflow:"hidden"}}>
            <div onClick={()=>tAcc("todos")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",cursor:"pointer",userSelect:"none",background:acc.todos?AZUL_CL:BRANCO}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:1,color:AZUL}}>📋 Todos os Cadastros</div>
                <div style={{padding:"2px 10px",borderRadius:10,background:AZUL_CL,fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:900,color:AZUL}}>{leads.length}</div>
              </div>
              <AccBtn open={acc.todos}/>
            </div>
            {acc.todos&&<div>
              <div style={{padding:"8px 20px",borderBottom:"1px solid "+BORDA,display:"flex",gap:8,justifyContent:"flex-end"}}>
                <select value={filtroCons} onChange={e=>setFiltroCons(e.target.value)} style={{padding:"6px 10px",border:"1px solid "+BORDA,borderRadius:2,fontSize:12,fontFamily:"Open Sans,sans-serif",outline:"none"}}>
                  <option value="todos">Todos os consultores</option>
                  {CONSULTORES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filtroSt} onChange={e=>setFiltroSt(e.target.value)} style={{padding:"6px 10px",border:"1px solid "+BORDA,borderRadius:2,fontSize:12,fontFamily:"Open Sans,sans-serif",outline:"none"}}>
                  <option value="todos">Todos os status</option>
                  {Object.keys(STATUS_COR).map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:OFF}}>{["Data","Posto","Cidade/UF","Consultor","DVR","Status",""].map(hh=><th key={hh} style={{padding:"8px 14px",textAlign:"left",fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:SUB,borderBottom:"1px solid "+BORDA,whiteSpace:"nowrap"}}>{hh}</th>)}</tr></thead>
                  <tbody>{filtrados.map(l=>(
                    <tr key={l.id} style={{borderBottom:"1px solid "+BORDA,cursor:"pointer"}} onClick={()=>setLeadSel(l)}>
                      <td style={{padding:"9px 14px",color:SUB,whiteSpace:"nowrap"}}>{fmtD(l.ts)}</td>
                      <td style={{padding:"9px 14px",fontWeight:700,fontFamily:"Montserrat,sans-serif"}}>{l.nomePosto}{l.isRede&&<span style={{marginLeft:6,padding:"1px 6px",background:AZUL_CL,color:AZUL,fontSize:10,borderRadius:2,fontWeight:700}}>REDE</span>}</td>
                      <td style={{padding:"9px 14px",color:SUB}}>{l.cidade}/{l.estado}</td>
                      <td style={{padding:"9px 14px",color:SUB,fontSize:11,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.consultor}</td>
                      <td style={{padding:"9px 14px",color:SUB}}>{l.marcaDVR}</td>
                      <td style={{padding:"9px 14px"}}>
                        <select value={l.status} onClick={e=>e.stopPropagation()} onChange={e=>setLeads(prev=>prev.map(p=>p.id===l.id?{...p,status:e.target.value}:p))}
                          style={{padding:"4px 8px",border:"1px solid "+(STATUS_COR[l.status]||BORDA)+"44",borderRadius:2,fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif",color:STATUS_COR[l.status]||TEXTO,background:(STATUS_COR[l.status]||BORDA)+"18",cursor:"pointer",outline:"none"}}>
                          {Object.keys(STATUS_COR).map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:"9px 14px"}}><button onClick={e=>{e.stopPropagation();setLeadSel(l);}} style={{background:AZUL_CL,color:AZUL,border:"none",borderRadius:2,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Ver</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>}
          </div>
        </>}
      </div>

      {leadSel&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
        <div style={{background:BRANCO,borderRadius:4,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",borderTop:"4px solid "+AZUL}}>
          <div style={{background:AZUL,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:900,color:BRANCO}}>{leadSel.nomePosto}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{leadSel.cidade}/{leadSel.estado} · {fmtD(leadSel.ts)}</div>
            </div>
            <button onClick={()=>setLeadSel(null)} style={{background:"rgba(255,255,255,.15)",border:"none",color:BRANCO,cursor:"pointer",padding:"6px 12px",borderRadius:2,fontSize:16}}>✕</button>
          </div>
          <div style={{padding:20}}>
            {[["Posto",[["CNPJ",leadSel.cnpj],["Local",leadSel.cidade+"/"+leadSel.estado],["Responsável",leadSel.responsavel],["Telefone",leadSel.telefone],["Consultor GDE",leadSel.consultor]]],
              ["Acesso DVR",[["Marca",leadSel.marcaDVR],["Tipo",leadSel.tipoAcesso],["Usuário",leadSel.tipoAcesso==="IP/DDNS"?leadSel.usuarioDVR:leadSel.usuarioP2P],["IP/Serial",leadSel.tipoAcesso==="IP/DDNS"?leadSel.ipDDNS+":"+leadSel.porta:leadSel.serialP2P]]],
              ["TI / Internet",[["Responsável TI",leadSel.nomeTI],["WhatsApp TI",leadSel.wppTI],["Internet",leadSel.internet],["Provedor",leadSel.provedor||"-"]]],
            ].map(([sec,rows])=>(
              <div key={sec} style={{marginBottom:16}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:AZUL,borderBottom:"2px solid "+AZUL_CL,paddingBottom:6,marginBottom:10}}>{sec}</div>
                {rows.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+BORDA,fontSize:13}}><span style={{color:SUB}}>{k}</span><span style={{fontWeight:600,textAlign:"right",maxWidth:280}}>{v}</span></div>)}
              </div>
            ))}
            {leadSel.justificativa&&<div style={{background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:2,padding:"10px 14px",marginTop:8}}>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,color:"#DC2626",marginBottom:4}}>JUSTIFICATIVA — NÃO INTEGRADO</div>
              <div style={{fontSize:13,color:"#991B1B"}}>{leadSel.justificativa}</div>
            </div>}
          </div>
        </div>
      </div>}
    </div>
  );

  if(tela==="mra")return(
    <div style={{fontFamily:"Open Sans,sans-serif",background:OFF,minHeight:"100vh",color:TEXTO}}>
      <div style={{background:BRANCO,borderBottom:"1px solid "+BORDA,padding:"0 32px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 8px rgba(0,60,120,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:18,color:AZUL_ESC}}>M.R.A</div>
          <div style={{width:1,height:18,background:BORDA}}/>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:SUB2}}>Funil de Integração · GDE</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[["funil","⚡ Funil"],["lista","📋 Lista"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setAbaMRA(id)} style={{padding:"6px 16px",borderRadius:2,border:"1px solid "+(abaMRA===id?AZUL:BORDA),background:abaMRA===id?AZUL_CL:"transparent",color:abaMRA===id?AZUL:SUB,fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>{lbl}</button>
          ))}
          <button onClick={()=>setTela("landing")} style={{background:"transparent",border:"1px solid "+BORDA,color:SUB,cursor:"pointer",padding:"6px 14px",borderRadius:2,fontSize:11,fontFamily:"Montserrat,sans-serif"}}>Sair</button>
        </div>
      </div>

      <div style={{padding:"20px 32px 0",maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {ETAPAS.map(e=>{
            const cnt=leads.filter(l=>l.status===e.id).length;
            return<div key={e.id} style={{background:BRANCO,border:"1px solid "+e.cor+"33",borderTop:"3px solid "+e.cor,borderRadius:2,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,60,120,.06)"}}>
              <div style={{fontSize:18,marginBottom:6}}>{e.icon}</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:"Montserrat,sans-serif",color:e.cor}}>{cnt}</div>
              <div style={{fontSize:10,color:SUB,fontFamily:"Montserrat,sans-serif",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{e.label}</div>
              <div style={{fontSize:10,color:e.cor+"99",marginTop:3,fontStyle:"italic"}}>{e.resp}</div>
            </div>;
          })}
        </div>
      </div>

      <div style={{padding:"20px 32px",maxWidth:1100,margin:"0 auto"}}>
        {abaMRA==="funil"&&<div>
          <div style={{background:"linear-gradient(135deg,"+AZUL_ESC+","+AZUL+")",borderRadius:4,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",overflowX:"auto"}}>
            {ETAPAS.map((e,i)=><div key={e.id} style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <div style={{textAlign:"center",padding:"0 10px"}}>
                <div style={{fontSize:16,marginBottom:3}}>{e.icon}</div>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,color:BRANCO,whiteSpace:"nowrap"}}>{e.label}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.55)",whiteSpace:"nowrap",marginTop:2}}>{e.resp}</div>
                <div style={{width:26,height:26,borderRadius:"50%",background:e.cor,margin:"5px auto 0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:900,color:BRANCO}}>{leads.filter(l=>l.status===e.id).length}</div>
              </div>
              {i<ETAPAS.length-1&&<div style={{fontSize:16,color:"rgba(255,255,255,.3)",flexShrink:0}}>→</div>}
            </div>)}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,alignItems:"start"}}>
            {ETAPAS.map(etapa=>{
              const col=[...leads].sort((a,b)=>new Date(a.ts).getTime()-new Date(b.ts).getTime()).filter(l=>l.status===etapa.id);
              return<div key={etapa.id}
                onDragOver={e=>{e.preventDefault();e.currentTarget.style.outline="2px dashed "+etapa.cor;e.currentTarget.style.borderRadius="6px";}}
                onDragLeave={e=>{e.currentTarget.style.outline="none";}}
                onDrop={e=>{e.currentTarget.style.outline="none";const lid=parseInt(e.dataTransfer.getData("leadId"));if(!lid)return;const ll=leads.find(x=>x.id===lid);if(ll)confirmarMover(ll,etapa);setDragId(null);}}>
                <div style={{background:etapa.cor+"10",borderTop:"3px solid "+etapa.cor,borderRadius:"4px 4px 0 0",padding:"12px 14px",marginBottom:2}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,color:etapa.cor,textTransform:"uppercase",letterSpacing:1}}>{etapa.icon} {etapa.label}</div>
                    <div style={{width:20,height:20,borderRadius:"50%",background:etapa.cor,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:900,color:BRANCO}}>{col.length}</div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <div style={{fontSize:9,color:SUB2}}>{etapa.resp}</div>
                    <div style={{fontSize:8,color:etapa.cor+"99",fontFamily:"Montserrat,sans-serif",fontWeight:600}}>↑ mais antigo</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,minHeight:80}}>
                  {col.length===0&&<div style={{background:"#F8FAFC",border:"1px dashed "+BORDA,borderRadius:4,padding:"18px 12px",textAlign:"center",fontSize:11,color:SUB2}}><div style={{fontSize:16,marginBottom:4}}>⬇️</div>Arraste aqui</div>}
                  {col.map((l,idx)=>{
                    const isPrimeiro=col[0]?.id===l.id;
                    const isNovo=(Date.now()-new Date(l.ts).getTime())<86400000;
                    return<div key={l.id} draggable
                      onDragStart={e=>{e.dataTransfer.setData("leadId",String(l.id));setDragId(l.id);e.currentTarget.style.opacity=".5";}}
                      onDragEnd={e=>{e.currentTarget.style.opacity="1";setDragId(null);}}
                      style={{background:BRANCO,border:"1px solid "+etapa.cor+"33",borderRadius:4,padding:"12px 14px",boxShadow:"0 2px 6px rgba(0,60,120,.06)",cursor:"grab"}}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px "+etapa.cor+"33";e.currentTarget.style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 6px rgba(0,60,120,.06)";e.currentTarget.style.transform="none";}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
                          <div style={{width:20,height:20,borderRadius:2,background:isPrimeiro?etapa.cor:etapa.cor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:900,color:isPrimeiro?BRANCO:etapa.cor,flexShrink:0}}>{posG(l.id)}º</div>
                          <div style={{fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif",color:TEXTO,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.nomePosto}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                          {isNovo&&<div style={{fontSize:8,fontFamily:"Montserrat,sans-serif",fontWeight:800,background:"#FEF3C7",color:"#D97706",padding:"1px 5px",borderRadius:2}}>NOVO</div>}
                          {isPrimeiro&&<div style={{fontSize:8,fontFamily:"Montserrat,sans-serif",fontWeight:800,background:etapa.cor+"22",color:etapa.cor,padding:"1px 5px",borderRadius:2}}>1º FILA</div>}
                          <div style={{color:BORDA,fontSize:14,cursor:"grab",letterSpacing:1}}>⠿</div>
                        </div>
                      </div>
                      <div style={{fontSize:10,color:SUB2,marginBottom:2}}>{l.cidade}/{l.estado}</div>
                      <div style={{fontSize:10,color:SUB2,marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.consultor}</div>
                      <div style={{fontSize:9,color:SUB2,marginBottom:10}}>📅 {fmtD(l.ts)}</div>
                      {etapa.prox&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <button onClick={()=>confirmarAvancar(l,etapa.prox)} style={{width:"100%",padding:"7px 8px",background:etapa.cor,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:9,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",color:BRANCO,cursor:"pointer"}}>{etapa.acao} →</button>
                        {etapa.id==="Em Processo de Integração"&&<button onClick={()=>{setModalNI(l);setJust("");}} style={{width:"100%",padding:"6px 8px",background:"transparent",border:"1px solid #DC2626",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:9,fontWeight:700,textTransform:"uppercase",color:"#DC2626",cursor:"pointer"}}>⛔ Não foi possível integrar</button>}
                      </div>}
                      {!etapa.prox&&<div style={{width:"100%",padding:"5px 8px",background:"#F1F5F9",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:9,fontWeight:700,color:SUB2,textAlign:"center"}}>✓ Ciclo Completo</div>}
                    </div>;
                  })}
                </div>
              </div>;
            })}
          </div>
        </div>}

        {abaMRA==="lista"&&<div style={{background:BRANCO,border:"1px solid "+BORDA,borderRadius:2,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,60,140,.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid "+BORDA,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:AZUL}}>Todos os Postos — Ordem de Cadastro</div>
            <div style={{fontSize:12,color:SUB2}}>Total: {leads.length}</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:OFF}}>{["#","Posto","Cidade/UF","Consultor","DVR","WhatsApp TI","Etapa","Ação"].map(hh=><th key={hh} style={{padding:"8px 12px",textAlign:"left",fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:SUB,borderBottom:"1px solid "+BORDA,whiteSpace:"nowrap"}}>{hh}</th>)}</tr></thead>
              <tbody>{leadsOrd.map((l,i)=>{
                const etapa=ETAPAS.find(e=>e.id===l.status)||ETAPAS[0];
                return<tr key={l.id} style={{borderBottom:"1px solid "+BORDA}}>
                  <td style={{padding:"10px 12px"}}><div style={{width:24,height:24,borderRadius:2,background:etapa.cor+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:900,color:etapa.cor}}>{i+1}º</div></td>
                  <td style={{padding:"10px 12px"}}><div style={{fontWeight:700,fontFamily:"Montserrat,sans-serif",color:TEXTO}}>{l.nomePosto}</div><div style={{fontSize:10,color:SUB2,marginTop:2}}>{fmtD(l.ts)} {fmtH(l.ts)}</div></td>
                  <td style={{padding:"10px 12px",color:SUB,fontSize:11}}>{l.cidade}/{l.estado}</td>
                  <td style={{padding:"10px 12px",color:SUB,fontSize:11,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.consultor}</td>
                  <td style={{padding:"10px 12px",color:SUB,fontSize:11}}>{l.marcaDVR}</td>
                  <td style={{padding:"10px 12px",color:SUB,fontSize:11}}>{l.wppTI||"-"}</td>
                  <td style={{padding:"10px 12px"}}><span style={{padding:"2px 8px",borderRadius:2,background:etapa.cor+"22",color:etapa.cor,fontSize:10,fontWeight:700,fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>{etapa.icon} {etapa.label}</span></td>
                  <td style={{padding:"10px 12px"}}>{etapa.prox?<button onClick={()=>confirmarAvancar(l,etapa.prox)} style={{padding:"5px 10px",background:etapa.cor,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:9,fontWeight:800,textTransform:"uppercase",color:BRANCO,cursor:"pointer",whiteSpace:"nowrap"}}>{etapa.acao} →</button>:<span style={{fontSize:10,color:SUB2}}>✓ Concluído</span>}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>}
      </div>

      {modalNI&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <div style={{background:BRANCO,borderRadius:4,width:"100%",maxWidth:460,borderTop:"4px solid #DC2626",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
          <div style={{background:"#DC2626",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:15,fontWeight:900,color:BRANCO}}>⛔ Não foi possível integrar</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginTop:2}}>{modalNI.nomePosto}</div>
            </div>
            <button onClick={()=>setModalNI(null)} style={{background:"rgba(255,255,255,.2)",border:"none",color:BRANCO,cursor:"pointer",padding:"6px 12px",borderRadius:2,fontSize:16}}>✕</button>
          </div>
          <div style={{padding:24}}>
            <div style={{fontSize:13,color:SUB,marginBottom:16,lineHeight:1.6}}>Registre o motivo. Este histórico ficará salvo para consulta futura.</div>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:TEXTO,marginBottom:6}}>Justificativa <span style={{color:"#DC2626"}}>*</span></div>
            <textarea value={just} onChange={e=>setJust(e.target.value)} placeholder="Ex: DVR sem acesso remoto, câmeras offline, sistema incompatível..." rows={4}
              style={{width:"100%",padding:"10px 12px",border:"1.5px solid #FECACA",borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:TEXTO,outline:"none",resize:"vertical",background:"#FFF5F5"}}/>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={()=>setModalNI(null)} style={{flex:1,padding:10,border:"1px solid "+BORDA,borderRadius:2,background:"transparent",color:SUB,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Cancelar</button>
              <button onClick={()=>{if(!just.trim()){alert("Informe a justificativa.");return;}setLeads(p=>p.map(l=>l.id===modalNI.id?{...l,status:"Não Integrado",justificativa:just.trim()}:l));setModalNI(null);setJust("");}}
                style={{flex:2,padding:10,border:"none",borderRadius:2,background:"#DC2626",color:BRANCO,cursor:"pointer",fontSize:12,fontFamily:"Montserrat,sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>
                Confirmar e Remover do Funil
              </button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );

  // ── PAINEL REVENDEDOR ──
  if(tela==="revendedor"&&revLogado){
    const meusCadastros=leads.filter(l=>l.emailRev===revLogado.email);
    const meusCadOrd=[...meusCadastros].sort((a,b)=>new Date(b.ts).getTime()-new Date(a.ts).getTime());

    const novoDoMesmoRev=()=>{
      const ultimo=meusCadOrd[0];
      if(ultimo){
        setFD({...FD0,
          isRede:ultimo.isRede?"sim":"nao",
          nomeRede:ultimo.nomeRede||"",
          qtdPostosRede:ultimo.qtdPostosRede||"",
          consultor:ultimo.consultor||"",
          consultorOutros:ultimo.consultorOutros||"",
          nomeTI:ultimo.nomeTI||"",
          cargoTI:ultimo.cargoTI||"",
          wppTI:ultimo.wppTI||"",
          emailTI:ultimo.emailTI||"",
          responsavel:ultimo.responsavel||"",
          telefone:ultimo.telefone||"",
        });
      } else setFD(FD0);
      setAbaPainel("novo");setEditandoId(null);setMaisUmPosto(true);
    };

    const editarCadastro=(l)=>{
      setFD({
        nomePosto:l.nomePosto||"",cnpj:l.cnpj||"",cidade:l.cidade||"",estado:l.estado||"",
        responsavel:l.responsavel||"",telefone:l.telefone||"",
        consultor:l.consultor||"",consultorOutros:l.consultorOutros||"",
        isRede:l.isRede?"sim":"nao",nomeRede:l.nomeRede||"",qtdPostosRede:l.qtdPostosRede||"",
        nomeTI:l.nomeTI||"",cargoTI:l.cargoTI||"",wppTI:l.wppTI||"",emailTI:l.emailTI||"",
        marcaDVR:l.marcaDVR||"",marcaDVROutro:l.marcaDVROutro||"",tipoAcesso:l.tipoAcesso||"",
        ipDDNS:l.ipDDNS||"",porta:l.porta||"",usuarioDVR:l.usuarioDVR||"",senhaDVR:l.senhaDVR||"",
        serialP2P:l.serialP2P||"",usuarioP2P:l.usuarioP2P||"",senhaP2P:l.senhaP2P||"",appP2P:l.appP2P||"",
        internet:l.internet||"",provedor:l.provedor||"",obs:l.obs||"",anexo:null,
      });
      setEditandoId(l.id);setAbaPainel("novo");
    };

    const salvarEdicao=(e)=>{
      e.preventDefault();
      setLeads(prev=>prev.map(l=>l.id===editandoId?{...l,...fd,isRede:fd.isRede==="sim",emailRev:revLogado.email,updatedAt:new Date().toISOString()}:l));
      setEditandoId(null);setAbaPainel("meus");setFD(FD0);
    };

    const submitNovoCadastro=(e)=>{
      e.preventDefault();
      setLeads(p=>[...p,{...fd,id:Date.now(),ts:new Date().toISOString(),status:"Novos Cadastros",isRede:fd.isRede==="sim",justificativa:"",emailRev:revLogado.email}]);
      setAbaPainel("meus");setFD(FD0);setEditandoId(null);setMaisUmPosto(false);
    };

    return(
      <div style={{fontFamily:"Open Sans,sans-serif",background:OFF,minHeight:"100vh",color:TEXTO}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Open+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
        
        {/* HEADER */}
        <div style={{background:AZUL_ESC,padding:"0 32px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:18,color:BRANCO}}>DISLUB <span style={{color:VERMELHO}}>EQUADOR</span></div>
            <div style={{width:1,height:18,background:"rgba(255,255,255,.2)"}}/>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.6)"}}>Área do Revendedor</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)",fontFamily:"Open Sans,sans-serif"}}>👤 {revLogado.email}</div>
            <button onClick={()=>{setRevLogado(null);setTela("landing");}} style={{background:"transparent",border:"1px solid rgba(255,255,255,.25)",color:"rgba(255,255,255,.7)",cursor:"pointer",padding:"6px 14px",borderRadius:2,fontSize:11,fontFamily:"Montserrat,sans-serif"}}>Sair</button>
          </div>
        </div>

        {/* ABAS */}
        <div style={{background:BRANCO,borderBottom:"1px solid "+BORDA,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex"}}>
            <div onClick={()=>{setAbaPainel("meus");setEditandoId(null);setFD(FD0);}} style={{padding:"16px 24px",cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,borderBottom:abaPainel==="meus"?"3px solid "+AZUL:"3px solid transparent",color:abaPainel==="meus"?AZUL:SUB,userSelect:"none"}}>
              📋 Meus Cadastros ({meusCadastros.length})
            </div>
            <div onClick={()=>{setAbaPainel("novo");setEditandoId(null);setFD(FD0);setMaisUmPosto(false);}} style={{padding:"16px 24px",cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,borderBottom:abaPainel==="novo"?"3px solid "+AZUL:"3px solid transparent",color:abaPainel==="novo"?AZUL:SUB,userSelect:"none"}}>
              ➕ {editandoId?"Editando Cadastro":maisUmPosto?"Adicionando Posto":"Novo Cadastro"}
            </div>
          </div>
          {meusCadastros.length>0&&abaPainel==="meus"&&(
            <button onClick={novoDoMesmoRev} style={{padding:"8px 18px",background:AZUL,color:BRANCO,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",cursor:"pointer"}}>
              ➕ Cadastrar Mais um Posto
            </button>
          )}
        </div>

        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 24px"}}>

          {/* MEUS CADASTROS */}
          {abaPainel==="meus"&&<>
            {meusCadOrd.length===0&&(
              <div style={{textAlign:"center",padding:"60px 32px",background:BRANCO,border:"1px solid "+BORDA,borderRadius:4}}>
                <div style={{fontSize:40,marginBottom:16}}>📋</div>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:900,color:TEXTO,marginBottom:8}}>Nenhum posto cadastrado ainda</div>
                <p style={{fontSize:13,color:SUB,marginBottom:24}}>Clique no botão abaixo para cadastrar seu primeiro posto no programa.</p>
                <button onClick={()=>setAbaPainel("novo")} style={{padding:"12px 28px",background:AZUL,color:BRANCO,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>Cadastrar meu primeiro posto →</button>
              </div>
            )}
            {meusCadOrd.map(l=>{
              const etapa=ETAPAS.find(e=>e.id===l.status)||ETAPAS[0];
              return(
                <div key={l.id} style={{background:BRANCO,border:"1px solid "+BORDA,borderLeft:"4px solid "+etapa.cor,borderRadius:2,padding:"18px 20px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"Montserrat,sans-serif",fontSize:15,fontWeight:900,color:TEXTO,marginBottom:3}}>{l.nomePosto}</div>
                      <div style={{fontSize:12,color:SUB}}>{l.cnpj} · {l.cidade}/{l.estado}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <div style={{padding:"4px 12px",borderRadius:10,background:etapa.cor+"22",color:etapa.cor,fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>{etapa.icon} {etapa.label}</div>
                      <button onClick={()=>editarCadastro(l)} style={{padding:"5px 12px",background:AZUL_CL,color:AZUL,border:"none",borderRadius:2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>✏️ Editar</button>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {[["Consultor GDE",l.consultor],["DVR",l.marcaDVR+" — "+l.tipoAcesso],["Cadastrado em",fmtD(l.ts)]].map(([k,v])=>(
                      <div key={k} style={{background:OFF,borderRadius:2,padding:"8px 10px"}}>
                        <div style={{fontSize:9,fontFamily:"Montserrat,sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,color:SUB2,marginBottom:2}}>{k}</div>
                        <div style={{fontSize:12,color:TEXTO,fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {l.justificativa&&<div style={{marginTop:10,padding:"8px 12px",background:"#FEE2E2",borderRadius:2,fontSize:12,color:"#991B1B"}}>⚠️ {l.justificativa}</div>}
                </div>
              );
            })}
          </>}

          {/* NOVO / EDITAR CADASTRO */}
          {abaPainel==="novo"&&(
            <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"4px solid "+AZUL,borderRadius:2,overflow:"hidden"}}>
              <div style={{background:AZUL,padding:"20px 28px"}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:900,color:BRANCO,marginBottom:2}}>
                  {editandoId?"✏️ Editando Cadastro":"➕ Novo Cadastro"}
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>
                  {editandoId?"Corrija as informações abaixo e salve.":"Preencha os dados do novo posto."}
                  {!editandoId&&meusCadOrd.length>0&&<span style={{background:"rgba(255,255,255,.15)",borderRadius:2,padding:"2px 8px",marginLeft:8,fontSize:11}}>✨ Dados da rede e TI já preenchidos</span>}
                </div>
              </div>
              <form onSubmit={editandoId?salvarEdicao:submitNovoCadastro} style={{padding:"28px 32px"}}>

                {/* SE FOR "MAIS UM POSTO" — mostra aviso com dados herdados */}
                {maisUmPosto&&!editandoId&&(
                  <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderLeft:"4px solid "+AZUL,borderRadius:2,padding:"12px 16px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{fontSize:18,flexShrink:0}}>✨</div>
                    <div>
                      <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:800,color:AZUL_ESC,marginBottom:4}}>Dados herdados do primeiro cadastro</div>
                      <div style={{fontSize:12,color:SUB,lineHeight:1.6}}>Rede, responsável e dados de TI já foram preenchidos automaticamente. Preencha apenas os dados específicos deste posto e as informações do DVR/NVR.</div>
                    </div>
                  </div>
                )}

                {/* REDE — só mostra no cadastro completo */}
                {!maisUmPosto&&<>
                  <FSec icon="🔗" txt="Faz Parte de uma Rede?"/>
                  <div style={{marginBottom:14}}>
                    <Lbl t="Esta unidade pertence a uma rede com mais postos?" req/>
                    <div style={{display:"flex",gap:10}}>
                      <Radio name="isRede2" val="sim" cur={fd.isRede} fn={v=>h("isRede",v)} label="Sim, somos uma rede"/>
                      <Radio name="isRede2" val="nao" cur={fd.isRede} fn={v=>h("isRede",v)} label="Não, posto único"/>
                    </div>
                  </div>
                  {fd.isRede==="sim"&&<>
                    <div style={{marginBottom:14}}><Lbl t="Nome da Rede / Grupo" req/><input type="text" placeholder="Ex: Grupo Petróleo Norte" value={fd.nomeRede} onChange={e=>h("nomeRede",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:TEXTO,background:OFF,outline:"none"}}/></div>
                    <div style={{marginBottom:14}}>
                      <Lbl t="Quantidade de Postos da Rede" req/>
                      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                        {["Até 4 postos","5 a 10 postos","11 a 29 postos","Acima de 30 postos"].map(v=><Radio key={v} name="qtdRede2" val={v} cur={fd.qtdPostosRede} fn={vv=>h("qtdPostosRede",vv)} label={v}/>)}
                      </div>
                    </div>
                  </>}
                </>}

                {/* POSTO — sempre aparece */}
                <FSec icon="🏪" txt="Informações do Posto"/>
                <div style={{marginBottom:14}}><Lbl t="Razão Social" req/><Inp ph="Ex: Distribuidora Norte Ltda" val={fd.cnpj} fn={v=>h("cnpj",v)} req/></div>
                <div style={{marginBottom:14}}><Lbl t="Nome Fantasia / Apelido do Posto" req/><Inp ph="Ex: Auto Posto Central" val={fd.nomePosto} fn={v=>h("nomePosto",v)} req/></div>
                <G2>
                  <div style={{marginBottom:14}}><Lbl t="Cidade" req/><Inp ph="Ex: Fortaleza" val={fd.cidade} fn={v=>h("cidade",v)} req/></div>
                  <div style={{marginBottom:14}}><Lbl t="Estado" req/><Inp ph="Ex: CE" val={fd.estado} fn={v=>h("estado",v)} req/></div>
                </G2>
                <G2>
                  <div style={{marginBottom:14}}><Lbl t="Nome do Proprietário ou Diretor Operacional" req/><Inp ph="Nome completo" val={fd.responsavel} fn={v=>h("responsavel",v)} req/></div>
                  <div style={{marginBottom:14}}><Lbl t="Telefone / WhatsApp" req/><Inp ph="(00) 00000-0000" val={fd.telefone} fn={v=>h("telefone",v)} type="tel" req/></div>
                </G2>

                {/* CONSULTOR — sempre aparece */}
                <div style={{marginBottom:14}}>
                  <Lbl t="Consultor GDE Responsável" req/>
                  <Sel opts={CONSULTORES} val={fd.consultor} fn={v=>{h("consultor",v);if(v!=="Outros")h("consultorOutros","");}} ph="Selecione seu consultor"/>
                  {fd.consultor==="Outros"&&<div style={{marginTop:10}}><input type="text" placeholder="Digite o nome do consultor" value={fd.consultorOutros} onChange={e=>h("consultorOutros",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+AZUL,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:TEXTO,background:BRANCO,outline:"none"}}/></div>}
                </div>

                {/* TI — só mostra no cadastro completo */}
                {!maisUmPosto&&<>
                  <FSec icon="👨‍💻" txt="Responsável de TI / Câmeras"/>
                  <G2>
                    <div style={{marginBottom:14}}><Lbl t="Nome do Responsável de TI" req/><Inp ph="Nome completo" val={fd.nomeTI} fn={v=>h("nomeTI",v)} req/></div>
                    <div style={{marginBottom:14}}><Lbl t="Cargo / Função"/><Inp ph="Ex: Técnico de TI" val={fd.cargoTI} fn={v=>h("cargoTI",v)}/></div>
                  </G2>
                  <G2>
                    <div style={{marginBottom:14}}><Lbl t="WhatsApp do Responsável de TI" req/><Inp ph="(00) 00000-0000" val={fd.wppTI} fn={v=>h("wppTI",v)} type="tel" req/></div>
                    <div style={{marginBottom:14}}><Lbl t="E-mail"/><Inp ph="ti@seuposto.com.br" val={fd.emailTI} fn={v=>h("emailTI",v)} type="email"/></div>
                  </G2>
                </>}
                <FSec icon="📹" txt="Dados para Acesso ao DVR/NVR"/>
                <div style={{marginBottom:14}}>
                  <Lbl t="Marca" req/>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {["Intelbras","Hikvision","Outro"].map(v=><Radio key={v} name="marcaDVR2" val={v} cur={fd.marcaDVR} fn={vv=>{h("marcaDVR",vv);if(vv!=="Outro")h("marcaDVROutro","");}} label={v}/>)}
                  </div>
                  {fd.marcaDVR==="Outro"&&<div style={{marginTop:10}}><input type="text" placeholder="Digite a marca" value={fd.marcaDVROutro} onChange={e=>h("marcaDVROutro",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+AZUL,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,color:TEXTO,background:BRANCO,outline:"none"}}/></div>}
                </div>
                <div style={{marginBottom:14}}>
                  <Lbl t="Tipo de Acesso" req/>
                  <div style={{display:"flex",gap:10}}>
                    <Radio name="tipoAcesso2" val="IP/DDNS" cur={fd.tipoAcesso} fn={v=>h("tipoAcesso",v)} label="IP/DDNS"/>
                    <Radio name="tipoAcesso2" val="P2P (App)" cur={fd.tipoAcesso} fn={v=>h("tipoAcesso",v)} label="P2P (App)"/>
                  </div>
                </div>
                {fd.tipoAcesso==="IP/DDNS"&&<div style={{background:"#EEF5FF",border:"1px solid "+BORDA,borderLeft:"4px solid "+AZUL,borderRadius:2,padding:"16px 18px",marginBottom:14}}>
                  <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,color:AZUL,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>🔹 Acesso via IP / DDNS</div>
                  <G2>
                    <div style={{marginBottom:12}}><Lbl t="IP ou DDNS" req/><input type="text" placeholder="Ex: 189.45.12.33" value={fd.ipDDNS} onChange={e=>h("ipDDNS",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                    <div style={{marginBottom:12}}><Lbl t="Porta" req/><input type="text" placeholder="Ex: 8000" value={fd.porta} onChange={e=>h("porta",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                  </G2>
                  <G2>
                    <div><Lbl t="Usuário" req/><input type="text" placeholder="Ex: admin" value={fd.usuarioDVR} onChange={e=>h("usuarioDVR",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                    <div><Lbl t="Senha" req/><input type="text" placeholder="Senha de acesso" value={fd.senhaDVR} onChange={e=>h("senhaDVR",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                  </G2>
                </div>}
                {fd.tipoAcesso==="P2P (App)"&&<div style={{background:"#EEF5FF",border:"1px solid "+BORDA,borderLeft:"4px solid "+AZUL,borderRadius:2,padding:"16px 18px",marginBottom:14}}>
                  <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,color:AZUL,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>🔹 Acesso via P2P (App)</div>
                  <div style={{marginBottom:12}}><Lbl t="Número de Série" req/><input type="text" placeholder="Ex: 123456789ABCDEF" value={fd.serialP2P} onChange={e=>h("serialP2P",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                  <G2>
                    <div style={{marginBottom:12}}><Lbl t="Usuário" req/><input type="text" placeholder="Ex: admin" value={fd.usuarioP2P} onChange={e=>h("usuarioP2P",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                    <div style={{marginBottom:12}}><Lbl t="Senha" req/><input type="text" placeholder="Senha de acesso" value={fd.senhaP2P} onChange={e=>h("senhaP2P",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                  </G2>
                  <div><Lbl t="App Utilizado" req/><input type="text" placeholder="Ex: Intelbras iSIC, Hik-Connect, DMSS..." value={fd.appP2P} onChange={e=>h("appP2P",e.target.value)} required style={{width:"100%",padding:"10px 12px",border:"1.5px solid "+BORDA,borderRadius:2,fontFamily:"Open Sans,sans-serif",fontSize:13,background:BRANCO,outline:"none"}}/></div>
                </div>}

                {/* UPLOAD PRINT DVR */}
                <div style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <Lbl t="Adicione o print da sessão Dados de Acesso do DVR/NVR"/>
                    <div style={{position:"relative",display:"inline-flex"}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:AZUL,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,fontWeight:900,color:BRANCO,flexShrink:0}}
                        onMouseEnter={e=>{const t=document.getElementById("dvr-tip");if(t)t.style.display="block";}}
                        onMouseLeave={e=>{const t=document.getElementById("dvr-tip");if(t)t.style.display="none";}}>?</div>
                      <div id="dvr-tip" style={{display:"none",position:"absolute",left:"50%",transform:"translateX(-50%)",bottom:"calc(100% + 8px)",background:TEXTO,color:BRANCO,borderRadius:4,padding:"12px 14px",width:260,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>
                        <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:6,color:"rgba(255,255,255,.7)"}}>Como tirar o print?</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.8)",lineHeight:1.6,marginBottom:8}}>Tire um print da tela de configurações do DVR/NVR mostrando os dados de acesso (IP, porta, usuário) ou da tela de login do app P2P.</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <div style={{background:"rgba(255,255,255,.1)",borderRadius:4,padding:"16px 8px",textAlign:"center",fontSize:10,color:"rgba(255,255,255,.5)"}}>📷 IP/DDNS<br/>(em breve)</div>
                          <div style={{background:"rgba(255,255,255,.1)",borderRadius:4,padding:"16px 8px",textAlign:"center",fontSize:10,color:"rgba(255,255,255,.5)"}}>📷 P2P (App)<br/>(em breve)</div>
                        </div>
                        <div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",width:10,height:10,background:TEXTO,clipPath:"polygon(0 0,100% 0,50% 100%)"}}/>
                      </div>
                    </div>
                  </div>
                  <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)h("anexo",f);}}
                    style={{border:"2px dashed "+(fd.anexo?AZUL:BORDA),borderRadius:4,padding:20,textAlign:"center",background:fd.anexo?AZUL_CL:OFF,cursor:"pointer",position:"relative",transition:"all .2s"}}>
                    <input type="file" accept="image/*,.pdf" onChange={e=>h("anexo",e.target.files?.[0]||null)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
                    {fd.anexo?(
                      <div>
                        <div style={{fontSize:22,marginBottom:6}}>✅</div>
                        <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,color:AZUL}}>{fd.anexo.name}</div>
                        <div style={{fontSize:11,color:SUB2,marginTop:2}}>Clique para trocar</div>
                      </div>
                    ):(
                      <div>
                        <div style={{fontSize:26,marginBottom:8}}>📎</div>
                        <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,color:SUB}}>Clique para anexar ou arraste a imagem aqui</div>
                        <div style={{fontSize:11,color:SUB2,marginTop:4}}>JPG, PNG ou PDF · Opcional</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,marginTop:8}}>
                  <button type="button" onClick={()=>{setAbaPainel("meus");setEditandoId(null);setFD(FD0);setMaisUmPosto(false);}} style={{flex:1,padding:13,border:"1px solid "+BORDA,borderRadius:2,background:"transparent",color:SUB,cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:600}}>Cancelar</button>
                  <button type="submit" style={{flex:3,padding:13,background:AZUL,color:BRANCO,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:800,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>
                    {editandoId?"💾 Salvar Alterações":"✅ Enviar Cadastro →"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      {/* WHATSAPP SUPORTE */}
      <a href="https://wa.me/5511991849168?text=Olá! Preciso de ajuda com o cadastro do programa Cliente Oculto 2.0." target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:"#25D366",borderRadius:30,boxShadow:"0 4px 20px rgba(37,211,102,.4)",textDecoration:"none"}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.531 5.845L.057 23.882l6.219-1.453A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.929 0-3.73-.518-5.27-1.415l-.378-.224-3.922.917.975-3.808-.247-.393A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        <div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,color:BRANCO,lineHeight:1}}>Precisa de ajuda?</div>
          <div style={{fontFamily:"Open Sans,sans-serif",fontSize:10,color:"rgba(255,255,255,.9)",marginTop:2}}>Fale com nosso suporte</div>
        </div>
      </a>
      </div>
    );
  }

    return(
    <div style={{fontFamily:"Open Sans,sans-serif",background:BRANCO,color:TEXTO,minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&family=Open+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,select:focus,textarea:focus{border-color:${AZUL}!important;outline:none;box-shadow:0 0 0 3px ${AZUL}18}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      <div style={{background:AZUL_ESC,padding:"7px 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10.5,color:"rgba(255,255,255,.55)"}}>Programa exclusivo para revendedores parceiros <strong style={{color:"rgba(255,255,255,.88)"}}>Dislub Equador</strong></div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setLoginTela("rev")} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.3)",color:"rgba(255,255,255,.9)",cursor:"pointer",padding:"4px 12px",borderRadius:2,fontSize:10,fontFamily:"Montserrat,sans-serif",fontWeight:700}}>🔑 Área do Revendedor</button>
          <button onClick={()=>setLoginTela("gde")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)",cursor:"pointer",padding:"4px 12px",borderRadius:2,fontSize:10,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Acesso GDE</button>
          <button onClick={()=>setLoginTela("mra")} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:"4px 12px",borderRadius:2,fontSize:10,fontFamily:"Montserrat,sans-serif",fontWeight:600}}>Acesso MRA</button>
        </div>
      </div>

      <div style={{background:BRANCO,borderBottom:"1px solid "+BORDA,padding:"0 32px",height:72,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 10px rgba(0,60,120,.07)"}}>
        <div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontWeight:900,fontSize:20,color:AZUL_ESC}}>DISLUB <span style={{color:VERMELHO}}>EQUADOR</span></div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:9,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:SUB2}}>Grupo Dislub Equador</div>
        </div>
        <div style={{background:AZUL,color:BRANCO,fontFamily:"Montserrat,sans-serif",fontSize:10.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",padding:"8px 18px",borderRadius:2}}>Programa Cliente Oculto 2.0</div>
      </div>

      <div style={{background:"linear-gradient(135deg,"+AZUL_ESC+" 0%,"+AZUL+" 100%)",padding:"60px 32px 52px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:5,background:VERMELHO}}/>
        <div style={{maxWidth:700,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:VERMELHO,animation:"blink 2s infinite"}}/>
            <span style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:"rgba(255,255,255,.7)"}}>Programa em andamento · 2026</span>
          </div>
          <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:"clamp(30px,5.5vw,50px)",fontWeight:900,color:BRANCO,lineHeight:1.06,letterSpacing:-1,textTransform:"uppercase",marginBottom:20}}>Bem-vindo ao<br/><span style={{color:VERMELHO}}>Cliente Oculto 2.0</span></h1>
          <p style={{fontSize:14.5,color:"rgba(255,255,255,.82)",lineHeight:1.75,fontWeight:300,maxWidth:520,paddingLeft:14,borderLeft:"3px solid rgba(255,255,255,.2)"}}>O Grupo Dislub Equador, em parceria com a M.R.A Monitoramento Operacional, apresenta uma nova evolução no modelo de cliente oculto. Mais frequência, mais inteligência e foco total em resultado.</p>
        </div>
      </div>

      <div style={{background:AZUL_CL,borderTop:"1px solid "+BORDA,borderBottom:"1px solid "+BORDA,padding:"22px 32px"}}>
        <div style={{maxWidth:700,margin:"0 auto",display:"flex",gap:16,alignItems:"flex-start"}}>
          <div style={{width:38,height:38,background:AZUL,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>ℹ️</div>
          <p style={{fontSize:13,color:SUB,lineHeight:1.7}}>Uma metodologia que avalia a <strong style={{color:AZUL_ESC}}>experiência real do cliente no seu posto de forma contínua</strong> — não é uma visita pontual. É um acompanhamento da execução da sua operação no dia a dia, sem custo para você.</p>
        </div>
      </div>

      <div style={{maxWidth:760,margin:"0 auto",padding:"52px 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+AZUL,borderRadius:2,padding:"22px 24px"}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:AZUL,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><div style={{width:20,height:2,background:VERMELHO}}/>O que será avaliado</div>
            {["Atendimento ao cliente na pista","Padrão de abordagem","Organização e limpeza","Postura da equipe","Oferta da campanha Duramais"].map(ii=><div key={ii} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+BORDA,fontSize:13}}><div style={{width:18,height:18,borderRadius:"50%",background:AZUL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:BRANCO,fontWeight:700,flexShrink:0}}>✓</div>{ii}</div>)}
          </div>
          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"3px solid "+VERMELHO,borderRadius:2,padding:"22px 24px"}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:VERMELHO,marginBottom:14,display:"flex",alignItems:"center",gap:8}}><div style={{width:20,height:2,background:AZUL}}/>O que você ganha</div>
            {["Mais padrão de atendimento","Mais controle da operação","Melhor execução das campanhas","Aumento de vendas"].map(ii=><div key={ii} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+BORDA,fontSize:13}}><div style={{width:18,height:18,borderRadius:"50%",background:VERMELHO,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:BRANCO,fontWeight:700,flexShrink:0}}>✓</div>{ii}</div>)}
            <div style={{marginTop:14,padding:"10px 14px",background:AZUL_CL,borderRadius:2,fontSize:12,color:AZUL_ESC,fontStyle:"italic",fontWeight:600}}>"Não é sobre opinião. É sobre o que realmente acontece no seu posto."</div>
          </div>
        </div>

        <div style={{marginTop:24,border:"1px solid "+BORDA,borderRadius:2,overflow:"hidden"}}>
          <div onClick={()=>setAccF(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",cursor:"pointer",background:accF?AZUL_CL:BRANCO,borderBottom:accF?"1px solid "+BORDA:"none",userSelect:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:36,height:36,background:accF?AZUL:AZUL_CL,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚙️</div>
              <div>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:14,fontWeight:900,color:AZUL_ESC,textTransform:"uppercase",letterSpacing:.3}}>Como Funciona na Prática</div>
                <div style={{fontSize:12,color:SUB,marginTop:2}}>Do CFTV à decisão em tempo real</div>
              </div>
            </div>
            <AccBtn open={accF}/>
          </div>
          {accF&&<div style={{padding:"24px 22px",background:BRANCO}}>
            {[["01","Avaliações recorrentes em diferentes dias e horários","Não é uma visita única — monitoramos de forma contínua para capturar a realidade da operação."],
              ["02","Visão real do comportamento da equipe","Usamos as câmeras CFTV já instaladas no seu posto, sem necessidade de novos equipamentos."],
              ["03","Identificação de falhas de execução","Cada desvio é registrado com evidência visual e classificado por categoria e gravidade."],
              ["04","Direcionamento para melhoria","As informações são consolidadas e compartilhadas com a Dislub Equador para apoiar o crescimento da sua unidade."]
            ].map(([n,t,d],i,a)=><div key={n} style={{display:"flex",gap:18,position:"relative"}}>
              {i<a.length-1&&<div style={{position:"absolute",left:20,top:42,bottom:-4,width:2,background:BORDA}}/>}
              <div style={{width:42,height:42,background:AZUL,color:BRANCO,fontFamily:"Montserrat,sans-serif",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:2,flexShrink:0,position:"relative",zIndex:1}}>{n}</div>
              <div style={{paddingBottom:28,paddingTop:8}}>
                <div style={{fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:.3,color:TEXTO,marginBottom:4}}>{t}</div>
                <div style={{fontSize:13,color:SUB,lineHeight:1.65}}>{d}</div>
              </div>
            </div>)}
          </div>}
        </div>
      </div>

      <div style={{background:OFF,borderTop:"1px solid "+BORDA,borderBottom:"1px solid "+BORDA}}>
        <div style={{maxWidth:760,margin:"0 auto",padding:"40px 32px"}}>
          <div style={{border:"1px solid "+BORDA,borderRadius:2,overflow:"hidden"}}>
            <div onClick={()=>setAccQ(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",cursor:"pointer",background:accQ?AZUL_CL:BRANCO,borderBottom:accQ?"1px solid "+BORDA:"none",userSelect:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:36,height:36,background:accQ?AZUL:AZUL_CL,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>❓</div>
                <div>
                  <div style={{fontFamily:"Montserrat,sans-serif",fontSize:14,fontWeight:900,color:AZUL_ESC,textTransform:"uppercase",letterSpacing:.3}}>Dúvidas Frequentes</div>
                  <div style={{fontSize:12,color:SUB,marginTop:2}}>Perguntas e respostas sobre o programa</div>
                </div>
              </div>
              <AccBtn open={accQ}/>
            </div>
            {accQ&&<div style={{padding:"24px 22px",background:BRANCO}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["Tem algum custo para o Revendedor?","Não. É um benefício do Grupo Dislub Equador para os parceiros poderem evoluir na operação com base em fatos."],
                  ["Esse trabalho é uma auditoria punitiva?","Não. O objetivo é melhorar a operação e aumentar resultados."],
                  ["Esse trabalho utiliza as câmeras do meu posto?","Sim. Utilizamos a estrutura já existente, sem necessidade de novos investimentos."],
                  ["Preciso instalar algum sistema?","Não. Você receberá um link seguro onde o responsável de TI poderá inserir as informações necessárias."],
                  ["Esse acesso compromete meu sistema?","Não. A conexão é controlada e não interfere na operação."],
                  ["Os dados ficam armazenados?","Não. As informações são utilizadas para análise e descartadas conforme nossa política de segurança."],
                  ["A operação do posto é impactada?","Não. Apenas analisamos e apontamos oportunidades de melhoria."],
                ].map(([q,a])=><div key={q} style={{background:OFF,border:"1px solid "+BORDA,borderRadius:2,padding:"14px 16px"}}>
                  <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,color:AZUL_ESC,marginBottom:6}}>Q: {q}</div>
                  <div style={{fontSize:12.5,color:SUB,lineHeight:1.6}}><strong style={{color:VERMELHO}}>A:</strong> {a}</div>
                </div>)}
              </div>
            </div>}
          </div>
        </div>
      </div>

      <div id="cadastro" style={{background:OFF,padding:"52px 32px"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:VERMELHO,marginBottom:6,display:"flex",alignItems:"center",gap:8}}><div style={{width:20,height:2,background:VERMELHO}}/>Próximo passo</div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:24,fontWeight:900,color:AZUL_ESC,textTransform:"uppercase",letterSpacing:-.3,marginBottom:8}}>Participe do Programa</div>
          <p style={{fontSize:13,color:SUB,marginBottom:28,lineHeight:1.7}}>Crie seu acesso para cadastrar seus postos e acompanhar o andamento da integração a qualquer momento. Para redes com vários postos, você cadastra um a um dentro da sua área exclusiva.</p>
          <div style={{background:BRANCO,border:"1px solid "+BORDA,borderTop:"4px solid "+AZUL,borderRadius:4,padding:36,boxShadow:"0 8px 32px rgba(0,60,140,.07)"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:40,marginBottom:12}}>🔑</div>
              <div style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:900,color:TEXTO,marginBottom:8}}>Crie seu acesso</div>
              <div style={{fontSize:13,color:SUB,lineHeight:1.6}}>Após criar sua conta, você preencherá o cadastro dos seus postos dentro da sua área exclusiva — com a possibilidade de corrigir informações a qualquer momento.</div>
            </div>

            <div style={{display:"flex",border:"1px solid "+BORDA,borderRadius:4,overflow:"hidden",marginBottom:24}}>
              {[["cadastrar","Criar meu acesso"],["login","Já tenho acesso"]].map(([m,l])=>(
                <div key={m} onClick={()=>{setRevModo(m);setRevErro("");}} style={{flex:1,padding:11,cursor:"pointer",fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:700,textAlign:"center",background:revModo===m?AZUL:BRANCO,color:revModo===m?BRANCO:SUB,transition:"all .15s",userSelect:"none"}}>{l}</div>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <Lbl t="E-mail" req/>
                <input type="email" placeholder="seu@email.com.br" value={revEmail}
                  onChange={e=>{setRevEmail(e.target.value);setRevErro("");}}
                  style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none"}}/>
              </div>
              <div>
                <Lbl t="Senha" req/>
                <input type="password" placeholder={revModo==="cadastrar"?"Crie uma senha (mín. 6 caracteres)":"Sua senha"} value={revSenha}
                  onChange={e=>{setRevSenha(e.target.value);setRevErro("");}}
                  style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none"}}/>
              </div>
              {revModo==="cadastrar"&&(
                <div>
                  <Lbl t="Confirmar Senha" req/>
                  <input type="password" placeholder="Digite a senha novamente" value={revSenhaConf}
                    onChange={e=>{setRevSenhaConf(e.target.value);setRevErro("");}}
                    style={{width:"100%",padding:"11px 13px",border:"1.5px solid "+BORDA,borderRadius:2,fontSize:13,fontFamily:"Open Sans,sans-serif",outline:"none"}}/>
                </div>
              )}
            </div>

            {revErro&&<div style={{marginTop:12,padding:"10px 14px",background:"#FFF5F5",border:"1px solid #FECACA",borderRadius:2,fontSize:12,color:VERMELHO}}>{revErro}</div>}

            <button onClick={()=>{
              if(revModo==="login"){
                const conta=contas.find(c=>c.email.toLowerCase()===revEmail.toLowerCase()&&c.senha===revSenha);
                if(conta){setRevLogado(conta);setTela("revendedor");setRevEmail("");setRevSenha("");setRevErro("");}
                else setRevErro("E-mail ou senha incorretos.");
              } else {
                if(!revEmail.trim()||!revSenha.trim()){setRevErro("Preencha e-mail e senha.");return;}
                if(revSenha!==revSenhaConf){setRevErro("As senhas não coincidem.");return;}
                if(revSenha.length<6){setRevErro("A senha deve ter pelo menos 6 caracteres.");return;}
                if(contas.find(c=>c.email.toLowerCase()===revEmail.toLowerCase())){setRevErro("Este e-mail já possui uma conta.");return;}
                const nova={email:revEmail.trim().toLowerCase(),senha:revSenha,criadoEm:new Date().toISOString()};
                setContas(p=>[...p,nova]);
                setRevLogado(nova);setTela("revendedor");setRevEmail("");setRevSenha("");setRevSenhaConf("");setRevErro("");
              }
            }}
              style={{width:"100%",padding:14,background:AZUL,color:BRANCO,border:"none",borderRadius:2,fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:800,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",marginTop:20}}>
              {revModo==="cadastrar"?"Criar minha conta e entrar →":"Entrar na minha área →"}
            </button>

            <div style={{textAlign:"center",marginTop:16,fontSize:11,color:SUB2,lineHeight:1.7}}>
              Seus dados são protegidos e tratados com sigilo conforme a LGPD.<br/>
              Após criar o acesso, você poderá cadastrar todos os seus postos.
            </div>
          </div>
        </div>
      </div>
      {/* BOTÃO WHATSAPP SUPORTE FIXO */}
      <a href="https://wa.me/5511991849168?text=Olá! Preciso de ajuda com o cadastro do programa Cliente Oculto 2.0." target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:"#25D366",borderRadius:30,boxShadow:"0 4px 20px rgba(37,211,102,.4)",textDecoration:"none",transition:"all .2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.531 5.845L.057 23.882l6.219-1.453A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.929 0-3.73-.518-5.27-1.415l-.378-.224-3.922.917.975-3.808-.247-.393A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        <div>
          <div style={{fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:800,color:BRANCO,lineHeight:1}}>Precisa de ajuda?</div>
          <div style={{fontFamily:"Open Sans,sans-serif",fontSize:10,color:"rgba(255,255,255,.9)",marginTop:2}}>Fale com nosso suporte</div>
        </div>
      </a>

      <footer style={{background:AZUL_ESC,padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontFamily:"Montserrat,sans-serif",fontSize:11,color:"rgba(255,255,255,.45)",lineHeight:1.6}}>
          <strong style={{color:"rgba(255,255,255,.8)"}}>© 2026 Grupo Dislub Equador</strong> — Todos os direitos reservados.<br/>
          Distribuidora Equador de Produtos de Petróleo S/A · CNPJ 03.128.979/0007-61
        </div>
        <a href="https://www.mramonitoramento.com.br" target="_blank" rel="noopener noreferrer" style={{fontFamily:"Montserrat,sans-serif",fontSize:10,color:"rgba(255,255,255,.3)",letterSpacing:.5,textAlign:"right",lineHeight:1.6,textDecoration:"none"}}>
          Monitoramento operacional em tempo real<br/><span style={{color:"rgba(255,255,255,.5)",fontWeight:700}}>M.R.A Gestão Operacional →</span>
        </a>
      </footer>
    </div>
  );
}

