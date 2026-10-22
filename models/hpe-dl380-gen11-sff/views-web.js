/* ---- iLO web interface: the laptop's browser on the iLO Service Port, with the iLO 6 web interface and its HTML5
   remote console. On the server's screen: Secure Start, the power-on self-test and the UEFI System Utilities (F9),
   down to the iLO 6 Configuration Utility (Network Options, User Management). Rebuilt from the trainer's screen
   recording of this server (iLO 6 firmware 1.67, System ROM U54 v2.44); the procedure follows the iLO 6 User Guide
   (configuring iLO network settings and user accounts with the iLO 6 Configuration Utility). Serial number, MAC,
   addresses and passwords are the lab's own, invented values. Timings are shortened. ---- */
const UU = n => `calc(var(--u)*${n})`;
(() => {
  if (document.getElementById('hpe-web-css')) return;
  const s = document.createElement('style'); s.id = 'hpe-web-css';
  const U = UU;
  s.textContent = `#stage .h6 svg:where(:not(.osx *)){display:inline-block;width:1em;height:1em}
.h6{background:#101418;border-radius:12px;padding:10px 10px 14px;border:1px solid #2A3540}
.h6 .cap2{color:#9AA9B5;font-size:12px;margin:0 0 6px}
.h6 .scr{background:#FFF;color:#1F2A33;border-radius:4px;overflow:hidden;min-height:620px;display:flex;flex-direction:column;font:13px/1.4 var(--font)}
.h6 .abar{display:flex;gap:8px;align-items:center;background:#E7EBEE;padding:6px 10px;border-bottom:1px solid #C3CBD1}
.h6 .abar input{flex:1;min-width:0;font:13px var(--mono);border:1px solid #C3CBD1;border-radius:14px;padding:4px 12px;color:#1D2A33;background:#FFF}
.h6 .abar .lock{font-size:12px;color:#B3261E;white-space:nowrap}
.h6 button:where(:not(.osx *,.osfd *)){font:500 13px var(--font);color:#1D2A33;background:#F3F5F6;border:1px solid #9AA7B1;border-radius:3px;padding:5px 12px;cursor:pointer}
.h6 button.go{background:#01A982;border-color:#01A982;color:#FFF}
.h6 .cue{outline:3px solid #E08A00!important;outline-offset:2px;animation:cuepulse 1.3s ease-in-out infinite}
.h6 .err:where(:not(.osx *)){flex:1;padding:40px 46px;color:#3C4650}.h6 .err:where(:not(.osx *)) h3{font:500 22px var(--font);margin:0 0 10px;color:#202124}
.h6 .login{flex:1;background:#2E3236;display:flex;align-items:center;justify-content:center;padding:26px}
.h6 .card{background:#FFF;width:340px;max-width:100%;box-sizing:border-box;border-radius:4px;padding:22px 26px;box-shadow:0 4px 20px rgba(0,0,0,.4)}
.h6 .card .brand{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.h6 .card .logo{width:46px;height:14px;border:3px solid #01A982;border-radius:2px}
.h6 .card h3{font:300 30px var(--font);margin:6px 0 2px}.h6 .card .host{color:#5A6670;font-size:13px;margin-bottom:14px}
.h6 .card label{display:block;font-size:12px;color:#5A6670;margin:8px 0 3px}.h6 .card input{width:100%;box-sizing:border-box;font:14px var(--font);border:1px solid #9AA7B1;border-radius:3px;padding:6px 8px}
.h6 .card .msg{margin-top:10px;font-size:12.5px;color:#B3261E;min-height:16px}
.i6w{flex:1;display:grid}
.i6w>*{grid-area:1/1}
.i6{display:flex;min-height:0}
.i6nav{width:172px;flex:none;background:#445462;color:#E9EDF0;padding:0 0 12px}
.i6brand{display:flex;gap:9px;align-items:center;padding:12px 10px 12px 12px}
#stage .i6brand svg{width:30px;height:30px;flex:none}
.i6brand b{display:block;font:600 15px/1.15 var(--font);color:#FFF}.i6brand small{font-size:10.5px;color:#D3DBE0}
.h6 .i6nav .n{display:block;width:100%;text-align:left;background:none;border:0;border-radius:0;color:#E9EDF0;padding:4px 12px;font:400 12.5px/1.35 var(--font)}
.h6 .i6nav .n[aria-current="true"]{background:#36434F}
.h6 .i6nav .n:hover{background:#3B4955}
.h6 .i6thumb{display:block;margin:14px 12px 0;width:calc(100% - 24px);height:88px;background:#000;border:1px solid #67747F;border-radius:2px;padding:6px 7px;text-align:left;font:600 5.5px/1.45 var(--mono);color:#A9B2B8;overflow:hidden;white-space:pre}
.i6main{flex:1;min-width:0;display:flex;flex-direction:column;background:#FFF}
.i6hd{display:flex;align-items:center;gap:10px;padding:12px 14px 8px;flex-wrap:wrap}
.i6hd h3{flex:1;margin:0;font:600 17px var(--font);color:#2A3036;min-width:220px}
.i6ic{display:flex;gap:8px;align-items:center}#stage .i6ic svg{width:19px;height:19px;display:block}
.h6 .i6ic button{background:none;border:0;padding:0;border-radius:50%}
.i6tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid #E3E6E8;padding:0 6px}
.h6 .i6tabs button{background:none;border:0;border-bottom:3px solid transparent;border-radius:0;padding:6px 8px 5px;color:#4A535B;font:400 12.5px var(--font)}
.h6 .i6tabs button[aria-current="true"]{color:#1E2328;border-bottom-color:#1E2328}
.i6body{padding:14px 18px 24px}
.i6cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:16px 28px}
.i6col h5{font:300 23px var(--font);margin:6px 0 8px;color:#2A3036}
.i6r{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:11.5px;padding:2px 0}
.i6r .k{font-weight:600;color:#2A3036;flex:none;max-width:58%}
.i6r .v{text-align:right;color:#3A4249;overflow-wrap:anywhere}
.h6 .lk{background:none;border:0;padding:0;font:600 11.5px var(--font);color:#2A3036;text-decoration:underline;cursor:pointer;text-align:left;border-radius:0}
.h6 .vl{background:none;border:0;padding:0;font:400 11.5px var(--font);color:#2A3036;text-decoration:underline;cursor:pointer;border-radius:0}
.i6 .st{display:inline-flex;align-items:center;gap:4px}#stage .i6 .st svg{width:12px;height:12px;flex:none}
.i6 h6{font:300 21px var(--font);margin:22px 0 8px;color:#2A3036}
.i6 .note{background:#F4F6F7;border-left:3px solid #01A982;padding:9px 12px;font-size:12.5px;color:#3A4249;margin:10px 0 12px;max-width:640px}
.i6 table{border-collapse:collapse;width:100%;font-size:12px}.i6 td,.i6 th{border-bottom:1px solid #E3E7EA;padding:5px 8px;text-align:left;vertical-align:top}.i6 th{color:#5A6670;font-weight:600}
.i6 .kv{display:grid;grid-template-columns:minmax(140px,220px) 1fr;gap:5px 14px;font-size:12.5px;max-width:600px}.i6 .kv>span:nth-child(odd){color:#5A6670;font-weight:600}
.i6 .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.i6 .pv{display:inline-block;font-size:10.5px;background:#E7F4F0;color:#1F6E58;border-radius:3px;padding:1px 5px;margin:1px 2px}
.i6w .fi{display:grid;grid-template-columns:minmax(130px,200px) minmax(0,260px);gap:7px 12px;align-items:center;font-size:12.5px}.i6w .fi input{font:12.5px var(--font);border:1px solid #C3CBD1;border-radius:3px;padding:4px 7px;background:#F1F3F4;color:#5A6670;min-width:0}
.i6w .fi input:not(:disabled){background:#FFF;color:#1F2A33;border-color:#9AA7B1}
.i6 .tb{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}.h6 .i6 .tb button{padding:4px 14px;font-size:12px}
.h6 .ck{background:none;border:0;padding:0;display:inline-flex;align-items:center;gap:7px;font:400 12.5px var(--font);color:#2A3036;text-align:left;border-radius:0}
.h6 .ck i{width:14px;height:14px;border:1.5px solid #6A747C;border-radius:2px;display:inline-block;position:relative;flex:none;box-sizing:border-box;background:#FFF}
.h6 .ck[aria-checked="true"] i{background:#01A982;border-color:#01A982}
.h6 .ck[aria-checked="true"] i::after{content:'';position:absolute;left:3.5px;top:0;width:4px;height:8px;border:solid #FFF;border-width:0 2px 2px 0;transform:rotate(45deg)}
.i6 tr.sel td{background:#E7F4F0}
.i6 .bts{display:flex;gap:8px;margin-top:14px}
.i6md{z-index:6;background:rgba(20,26,32,.45);display:flex;align-items:flex-start;justify-content:center;padding:34px 12px}
.i6dw{background:#FFF;width:min(470px,100%);box-sizing:border-box;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,.45);padding:16px 20px 18px;font-size:12.5px;color:#2A3036}
.i6dw h4{margin:0 0 12px;font:600 17px var(--font)}.i6dw p{margin:0 0 12px;line-height:1.45}
.i6dw .fi{margin-bottom:10px}
.i6dw .pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px 14px;margin:6px 0 10px}
.i6dw .er{color:#B3261E;min-height:16px;margin:4px 0 8px}
.i6dw .bt{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
@media (max-width:760px){.rcw{overflow-x:auto}.rcw .rcscr{min-width:740px}.mon .bez{overflow-x:auto}.mon .bez .rcscr{min-width:740px}}
@media (max-width:640px){.i6{flex-direction:column}.i6nav{width:auto;display:flex;flex-wrap:wrap;padding:0 0 6px}.i6brand{width:100%}.h6 .i6nav .n{width:auto}.h6 .i6thumb{display:none}}
.rcw{align-self:start;justify-self:center;width:97.6%;margin-top:6px;background:#262626;border-radius:6px;box-shadow:0 10px 34px rgba(0,0,0,.55);z-index:4;display:flex;flex-direction:column;position:relative}
.rct{display:flex;align-items:center;gap:3px;padding:4px 8px 3px;position:relative}
.rct .t{flex:1;text-align:center;font:600 12px var(--font);color:#F2F2F2}
.h6 .rct .b{background:none;border:0;padding:2px 3px;border-radius:3px;line-height:0;color:#CFCFCF;display:inline-block}
.h6 .rct button.b:hover{background:#3C3C3C}
#stage .rct svg{width:21px;height:21px;display:block}
.rcm{position:absolute;top:31px;left:4px;display:flex;z-index:7;align-items:flex-start}
.rcm .col{background:#D3D6D8;min-width:118px;box-shadow:0 6px 14px rgba(0,0,0,.45);display:flex;flex-direction:column;padding:2px 0}
.h6 .rcm button{background:none;border:0;border-radius:0;text-align:left;padding:7px 14px;font:400 12.5px var(--font);color:#1E2124;display:flex;justify-content:space-between;align-items:center;gap:14px}
.h6 .rcm button[aria-current="true"],.h6 .rcm button:hover{background:#B9BEC1}
.h6 .rcm .col2 button{justify-content:flex-start;gap:8px;padding-left:10px}#stage .rcm .col2 svg{width:14px;height:14px}
.rcs{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 10px 4px;font:700 10px var(--font);color:#D2D2D2}
.rcscr{position:relative;width:100%;aspect-ratio:4/3;background:#000;overflow:hidden;container-type:inline-size;outline:none}.rcscr:focus,.rcscr:focus-visible{outline:none}
.mon .bez{background:#1B1E21;border:1px solid #3A4046;border-radius:12px;padding:16px 16px 6px;max-width:860px;margin:0 auto}
.mon .bezb{display:flex;justify-content:space-between;align-items:center;padding:6px 2px 2px;font:700 10px var(--font);color:#8E99A3;min-height:14px}
.mon .bezb i{width:7px;height:7px;border-radius:50%;background:#3A4046}.mon .bezb i.on{background:#45D07F}
.mon .rck{justify-content:center;padding-top:10px}
.rck{display:flex;flex-wrap:wrap;gap:4px;padding:2px 8px 8px;align-items:center;color:#AEB7BF;font:11px var(--font)}
.h6 .rck button{background:#3A3F44;color:#EEE;border:1px solid #5B6268;border-radius:3px;padding:3px 7px;font:700 11px var(--mono)}
.cc{position:absolute;left:0;top:0;width:100cqw;height:75cqw;--u:calc(100cqw / 1024);font-family:Arial,Helvetica,sans-serif;overflow:hidden;color:#111}
.cc .tx{position:absolute;left:${U(8)};margin:0;white-space:pre;font:700 ${U(13.3)}/${U(19.6)} 'Courier New',Courier,monospace;color:#E9E9E9}
.cc .tx.os{font-weight:400;line-height:${U(16)};color:#C9C9C9;top:${U(4)}}
.cc .tx .c{color:#58D3EA}.cc .tx.y{color:#F2E15A}
.cc .band{position:absolute;left:0;right:0;top:0;height:${U(124)};background:linear-gradient(#3C3C3C,#151515 72%,#000)}
.cc .ptl{position:absolute;left:${U(21)};top:${U(28)};font:800 ${U(46)}/1 Arial,Helvetica,sans-serif;color:#FFF;letter-spacing:${U(1)}}
.cc .pbar{position:absolute;left:${U(23)};top:${U(90)};width:${U(317)};height:${U(15)};border:${U(2)} solid #D9D9D9;border-radius:${U(2)};box-sizing:border-box;background:#0D0D0D;overflow:hidden}
.cc .pbar i{display:block;height:100%;background:linear-gradient(#5CC9AE,#1E8E73)}
.cc .hl{position:absolute;left:${U(812)};top:${U(20)};color:#FFF;font:700 ${U(22)}/1.05 Arial,Helvetica,sans-serif}
.cc .hl i{display:block;width:${U(57)};height:${U(12)};border:${U(3)} solid #01A982;margin-bottom:${U(7)}}
.cc .hl b{display:block}.cc .hl em{display:block;font-style:normal;font-weight:400}
.cc .srv{position:absolute;left:${U(812)};top:${U(128)};width:${U(204)};height:${U(132)}}#stage .cc .srv svg{width:100%;height:100%;display:block}
.cc .fk{position:absolute;left:${U(6)};top:${U(724)};display:flex;align-items:center;font:700 ${U(13.3)} 'Courier New',Courier,monospace;color:#E9E9E9;white-space:nowrap}
.cc .fk b{display:inline-block;border:${U(2)} solid #E9E9E9;border-radius:${U(5)};padding:${U(3)} ${U(10)};margin-right:${U(10)}}
.cc .fk b.on{background:#E9E9E9;color:#000}.cc .fk span{margin-right:${U(26)}}
.cc .nov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#7C8790;font:400 ${U(18)} Arial,sans-serif;text-align:center;padding:0 ${U(80)}}
.rb .h{position:absolute;left:0;top:0;width:100%;height:${U(76)};background:#3B4857;color:#FFF}
.rb .lg{position:absolute;left:${U(21)};top:${U(13)};font:700 ${U(13)}/1.12 Arial,sans-serif;color:#FFF}
.rb .lg i{display:block;width:${U(40)};height:${U(9)};border:${U(2.4)} solid #01A982;margin-bottom:${U(5)}}
.rb .lg em{display:block;font-style:normal;font-weight:400}
.rb .tt{position:absolute;left:${U(178)};top:${U(21)};font:400 ${U(30)}/1 Arial,sans-serif}
.rb .ics{position:absolute;right:${U(22)};top:${U(26)};display:flex;gap:${U(17)}}#stage .rb .ics svg{width:${U(22)};height:${U(22)};display:block}
.rb .cr{position:absolute;left:0;top:${U(76)};width:100%;height:${U(50)};background:#3B4857;display:flex;align-items:stretch;border-top:${U(1)} solid #4A5866;overflow:hidden}
.h6 .rb .cr button{position:relative;background:none;border:0;border-radius:0;color:#FFF;font:400 ${U(14.5)} Arial,sans-serif;padding:0 ${U(34)} 0 ${U(20)};display:flex;align-items:center;gap:${U(8)}}
.h6 .rb .cr button.cur{background:#4B5965}
#stage .rb .cr button svg{display:block}#stage .rb .cr .hm{width:${U(18)};height:${U(18)}}
#stage .rb .cr .chev{position:absolute;right:0;top:0;height:100%;width:${U(22)}}
.rb .l1{position:absolute;left:0;top:${U(126)};width:${U(307)};height:${U(316)};background:#5D7771;color:#EEF3F2;padding:${U(14)};box-sizing:border-box}
.rb .l1 b{display:block;font:400 ${U(22)}/1.15 Arial,sans-serif;color:#FFF}
.rb .l1 p{margin:${U(8)} 0 0;font:400 ${U(12.5)}/1.3 Arial,sans-serif}
.rb .l2{position:absolute;left:0;top:${U(446)};width:${U(307)};height:${U(248)};background:#7F756C;color:#F1EEEA;padding:${U(12)} ${U(14)};box-sizing:border-box;font:400 ${U(11.5)}/1.35 Arial,sans-serif}
.rb .l2 table{border-collapse:collapse}.rb .l2 td{padding:0 ${U(16)} 0 0}
.rb .l2 .qr{position:absolute;left:${U(104)};top:${U(130)};width:${U(96)};height:${U(96)}}#stage .rb .l2 .qr svg{width:100%;height:100%;display:block}
.rb .l2 small{position:absolute;left:${U(4)};bottom:${U(3)};font-size:${U(9.5)};color:#EEE}
.rb .m{position:absolute;left:${U(307)};top:${U(126)};right:0;height:${U(568)};background:#FDFFFF;overflow:hidden}
.rb .m h4{margin:0;padding:${U(12)} ${U(22)} ${U(10)};font:400 ${U(29)}/1.1 Arial,sans-serif;color:#111}
.rb .rr{position:relative;display:flex;align-items:center;min-height:${U(30.6)};padding-left:${U(22)}}
.rb .rr.gap{height:${U(14)}}
.h6 .rb .lb{width:${U(374)};flex:none;font:700 ${U(15)}/1 Arial,sans-serif;color:#151515;background:none;border:0;padding:0;text-align:left;display:flex;align-items:center;gap:${U(8)};border-radius:0}
.h6 .rb .lb.sel{color:#3E9F86}
.h6 .rb .lb.lnk{width:auto;max-width:${U(690)};line-height:1.12;padding:${U(3)} 0}
.h6 .rb .lb.lnk.sel{color:#151515}.h6 .rb .lb.lnk.sel span{background:#49A78D;color:#FFF;padding:${U(3)} ${U(5)};margin:0 0 0 ${U(-5)}}
.rb .ld{display:inline-block;width:${U(9)};height:${U(9)};border:${U(1.6)} solid #7CC6B6;border-radius:50%;position:relative;flex:none}
.rb .ld::after{content:'';position:absolute;left:${U(2)};top:${U(2)};width:${U(5)};height:${U(5)};border-radius:50%;background:#7CC6B6}
.rb .ctl{position:relative;width:${U(282)};height:${U(23)}}
.h6 .rb .dd,.h6 .rb .tf{box-sizing:border-box;width:100%;height:100%;border:${U(1)} solid #B9BCBC;background:#FFF;border-radius:0;font:400 ${U(12.5)} Arial,sans-serif;color:#111;padding:0 ${U(8)};display:flex;align-items:center;margin:0}
.h6 .rb .dd{justify-content:center;position:relative}
#stage .rb .dd svg{position:absolute;right:${U(6)};top:${U(5)};width:${U(12)};height:${U(12)}}
.h6 .rb .dd.on{background:#49A78D;color:#FFF;border-color:#49A78D}
.h6 .rb input.tf{cursor:text;outline:none}
.h6 .rb input.tf:focus{border-color:#49A78D;box-shadow:0 0 0 ${U(1)} #49A78D}
.h6 .rb .tf.ro{background:#C9CBC9;color:#6E716F;cursor:default}
.rb .tf .ph{color:#8B8F92}
#stage .rb .tf svg{margin-left:auto;width:${U(12)};height:${U(12)}}
.rb .pop{position:absolute;left:0;right:0;top:100%;background:#FFF;border:${U(1)} solid #B9BCBC;z-index:5;display:flex;flex-direction:column;box-shadow:0 ${U(4)} ${U(10)} rgba(0,0,0,.25)}
.rb .pop.up{top:auto;bottom:100%}
.h6 .rb .pop button{background:#FFF;border:0;border-radius:0;text-align:left;font:400 ${U(12.5)} Arial,sans-serif;color:#111;padding:${U(5)} ${U(8)}}
.h6 .rb .pop button.cur{background:#C6EFE3}
.h6 .rb .pop button:hover{background:#A9E3D2}
.rb .b{position:absolute;left:0;top:${U(694)};width:100%;height:${U(74)};background:#384956;display:flex;align-items:center;gap:${U(14)};padding:0 ${U(26)} 0 ${U(32)};box-sizing:border-box;color:#FFF;font:400 ${U(12)} Arial,sans-serif}
.h6 .rb .b .bx{background:none;border:${U(1.5)} solid #E9EDF0;color:#FFF;border-radius:${U(2)};font:400 ${U(12)} Arial,sans-serif;height:${U(28)};padding:0 ${U(12)};min-width:${U(136)}}
.h6 .rb .b .bx.dim{opacity:.45}
.rb .b .rd{display:flex;align-items:center;gap:${U(6)};margin-left:${U(8)}}
.rb .b .rd i{width:${U(11)};height:${U(11)};border:${U(1.5)} solid #E9EDF0;border-radius:50%;box-sizing:border-box;display:inline-block}
.rb .b .rd.on i{background:#E5643B;box-shadow:inset 0 0 0 ${U(2)} #384956}
.rb .b .sp{flex:1}
.rb .dl{position:absolute;inset:0;background:rgba(0,0,0,.1);z-index:8}
.rb .dw{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:${U(450)};background:#FFF;box-shadow:0 ${U(6)} ${U(22)} rgba(0,0,0,.45);border:${U(1)} solid #8D979C}
.rb .dw .dh{height:${U(46)};background:#3A4956;position:relative;color:#FFF;font:400 ${U(22)} Arial,sans-serif;display:flex;align-items:center;padding:0 ${U(16)}}
.rb .dw .dh i{display:block;width:${U(40)};height:${U(9)};border:${U(2.4)} solid #01A982}
.h6 .rb .dw .dh .x{position:absolute;right:${U(10)};top:${U(8)};background:none;border:0;color:#FFF;font:300 ${U(26)}/1 Arial,sans-serif;padding:0 ${U(4)}}
.rb .dw .db{padding:${U(18)} ${U(22)} ${U(16)};display:flex;gap:${U(12)}}
.rb .dw .db>div{flex:1;min-width:0}
.rb .dw .qi{flex:none;width:${U(34)};height:${U(34)};border-radius:50%;background:#2F8FD8;color:#FFF;font:700 ${U(24)}/${U(34)} Arial,sans-serif;text-align:center}
.rb .dw .qi.e{background:#C9302C}
.rb .dw h5{margin:0;font:400 ${U(22)}/1.1 Arial,sans-serif;color:#111}
.rb .dw p{margin:${U(5)} 0 0;font:400 ${U(12)}/1.35 Arial,sans-serif;color:#222}
.rb .dw .bt{display:flex;gap:${U(10)};justify-content:center;padding:0 ${U(18)} ${U(18)}}
.h6 .rb .dw .bt button{font:400 ${U(12)} Arial,sans-serif;height:${U(24)};min-width:${U(120)};white-space:nowrap;background:#FFF;border:${U(1)} solid #9DA3A6;color:#111;border-radius:0;padding:0 ${U(8)}}
.h6 .rb .dw .bt button.pri{background:#4BA990;border-color:#4BA990;color:#FFF}
.rb .dw label{display:block;font:700 ${U(12.5)} Arial,sans-serif;margin:${U(8)} 0 ${U(3)}}
.rb .dw input{box-sizing:border-box;width:100%;height:${U(26)};border:${U(1)} solid #9DA3A6;font:400 ${U(13)} Arial,sans-serif;padding:0 ${U(6)}}
.rb .dw .er{color:#C0392B;font:400 ${U(12)} Arial,sans-serif;min-height:${U(15)};margin-top:${U(6)}}
.rb .dw .pg{height:${U(12)};background:#E3E3E3;margin-top:${U(12)}}.rb .dw .pg i{display:block;height:100%;background:#F08C6C}`;
  Sim.addCss(s);
})();

/* ============ constants and helpers ============ */
const CT = { secure: 1.5, post: 6, win: 12, f9: 2, start: 1.5, boot: 4, reset: 6 };
const ROM = 'U54 v2.44 (01/17/2025)', ILOFW = '1.67 Feb 27 2025';
const ipNum = s => { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(s || '').trim()); if (!m) return null; const p = m.slice(1).map(Number); if (p.some(x => x > 255)) return null; return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; };
const maskOk = m => m !== null && m !== 0 && (((~m >>> 0) + 1) & (~m >>> 0)) === 0;
const cpuFull = () => 'Intel(R) Xeon(R) ' + CATALOG.cpu.short.replace(/^Xeon\s+/, '');
const liveIp = t => t.iloCfg.live.dhcp === 'ON' ? '0.0.0.0' : t.iloCfg.live.ip;
const nowStr = () => { const d = new Date(); return `${d.toDateString().slice(0, 10)} ${d.toTimeString().slice(0, 8)} ${d.getFullYear()}`; };
const SV = (vb, inner) => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;
const G6 = '#3E9C84', GR = '#6B6B6B';
const ICO = {
  logo: SV('0 0 32 32', '<path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z" fill="none" stroke="#33B596" stroke-width="2.6"/><path d="M16 9.6 22 13v6.9L16 23.4 10 19.9V13z" fill="none" stroke="#33B596" stroke-width="2.2"/><path d="M16 2.5v7.1M27.7 9.25 22 13M4.3 9.25 10 13" stroke="#33B596" stroke-width="1.6"/>'),
  power: on => SV('0 0 24 24', `<circle cx="12" cy="13" r="8.6" fill="${on ? G6 : '#A9B0B6'}"/><path d="M12 2.6v8.2" stroke="#4E555B" stroke-width="2.6" stroke-linecap="round"/>`),
  uid: on => { const c = on ? '#2F8FD8' : GR; return SV('0 0 24 24', `<circle cx="12" cy="10.5" r="7.4" fill="none" stroke="${c}" stroke-width="2.3"/><circle cx="12" cy="10.5" r="2.5" fill="${c}"/><path d="M12 18v4" stroke="${c}" stroke-width="2.2"/>`); },
  check: (c = G6) => SV('0 0 24 24', `<circle cx="12" cy="12" r="10" fill="${c}"/><path d="M7.2 12.4l3.2 3.2 6.4-6.6" fill="none" stroke="#FFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`),
  sun: SV('0 0 24 24', `<circle cx="12" cy="12" r="4.6" fill="${G6}"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="${GR}" stroke-width="1.8" stroke-linecap="round"/>`),
  hex: SV('0 0 24 24', `<path d="M12 1.8l8.9 5.1v10.2L12 22.2l-8.9-5.1V6.9z" fill="${G6}" stroke="#2B6F5E" stroke-width="1.2"/><path d="M12 7.4l4 2.3v4.6l-4 2.3-4-2.3V9.7z" fill="none" stroke="#1E4D41" stroke-width="1.7"/>`),
  shield: SV('0 0 24 24', '<path d="M12 2.2l8 3.1v6.1c0 5.1-3.5 8.6-8 10.4-4.5-1.8-8-5.3-8-10.4V5.3z" fill="#D9534A"/><path d="M12 2.6v18.6M4.4 10.6h15.2" stroke="#8C2B26" stroke-width="1.4"/>'),
  user: SV('0 0 24 24', `<circle cx="12" cy="7.6" r="4.4" fill="none" stroke="${GR}" stroke-width="1.9"/><path d="M4.5 22v-4.2c0-2.8 2.4-4.9 5-4.9h5c2.6 0 5 2.1 5 4.9V22M9 17.5V22M15 17.5V22" fill="none" stroke="${GR}" stroke-width="1.9"/>`),
  help: SV('0 0 24 24', `<path d="M8.4 8.2a3.7 3.7 0 1 1 5.4 3.3c-1.2.7-1.8 1.4-1.8 2.9v.9" fill="none" stroke="${GR}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19.4" r="1.3" fill="${GR}"/>`),
  warn: SV('0 0 24 24', '<path d="M12 3 22 20.5H2z" fill="#F0B323"/><path d="M12 9.5v5" stroke="#3A2A00" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.2" fill="#3A2A00"/>'),
  info: SV('0 0 24 24', `<circle cx="12" cy="12" r="9.2" fill="none" stroke="${GR}" stroke-width="1.8"/><path d="M12 10.5v6.5" stroke="${GR}" stroke-width="2"/><circle cx="12" cy="7.4" r="1.3" fill="${GR}"/>`),
  dot: c => SV('0 0 24 24', `<circle cx="12" cy="12" r="8" fill="${c}"/>`),
  minus: SV('0 0 24 24', `<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="${GR}" stroke-width="1.8"/><path d="M7.5 12h9" stroke="${GR}" stroke-width="2"/>`),
  ext: SV('0 0 24 24', '<rect x="3" y="7" width="14" height="14" fill="none" stroke="#2A3036" stroke-width="2"/><path d="M9 3h12v12M14 10l7-7" fill="none" stroke="#2A3036" stroke-width="2"/>'),
};
const W = '#D0D0D0';
const RCI = {
  menu: SV('0 0 24 24', `<path d="M12 2.4l8.4 4.85v9.7L12 21.8l-8.4-4.85v-9.7z" fill="none" stroke="${W}" stroke-width="1.8"/><path d="M12 7.6l3.9 2.25v4.5L12 16.6l-3.9-2.25v-4.5z" fill="none" stroke="${W}" stroke-width="1.6"/><path d="M12 2.4v5.2M20.4 7.25l-4.5 2.6M3.6 7.25l4.5 2.6" stroke="${W}" stroke-width="1.2"/>`),
  kbd: SV('0 0 30 20', `<rect x="1" y="2.5" width="28" height="15" rx="2" fill="none" stroke="${W}" stroke-width="1.6"/>${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5, 6, 7].map(c => `<rect x="${4 + c * 2.9}" y="${5.2 + r * 3}" width="1.8" height="1.8" fill="${W}"/>`).join('')).join('')}<rect x="8" y="14.2" width="14" height="1.6" fill="${W}"/>`),
  disc: SV('0 0 24 24', `<circle cx="12" cy="12" r="9.5" fill="none" stroke="${W}" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="${W}" stroke-width="1.6"/>`),
  win: SV('0 0 24 24', `<rect x="3" y="4" width="18" height="16" fill="none" stroke="${W}" stroke-width="1.5"/><path d="M3 8.5h18M9 8.5V20" stroke="${W}" stroke-width="1.5"/>`),
  max: SV('0 0 24 24', `<rect x="3" y="4" width="18" height="16" fill="none" stroke="${W}" stroke-width="1.5"/><path d="M3 8h18" stroke="${W}" stroke-width="1.5"/>`),
  full: SV('0 0 24 24', `<path d="M14 3h7v7M21 3l-7 7M10 21H3v-7M3 21l7-7" fill="none" stroke="${W}" stroke-width="1.5"/>`),
  x: SV('0 0 24 24', `<path d="M4 4l16 16M20 4L4 20" stroke="${W}" stroke-width="1.8"/>`),
};
const PWI = { momentary: '<path d="M12 3v8" stroke="#333" stroke-width="2"/><path d="M7 6.5a7 7 0 1 0 10 0" fill="none" stroke="#333" stroke-width="2"/>', hold: '<path d="M12 3v8" stroke="#333" stroke-width="2"/><path d="M7 6.5a7 7 0 1 0 10 0" fill="none" stroke="#333" stroke-width="2"/><circle cx="18.5" cy="18.5" r="3.2" fill="#333"/>', cold: '<circle cx="12" cy="12" r="8" fill="none" stroke="#333" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="#333" stroke-width="1.6"/>', reset: '<path d="M5 12a7 7 0 1 0 2.2-5.1" fill="none" stroke="#333" stroke-width="2"/><path d="M4 3.8v4.6h4.6" fill="none" stroke="#333" stroke-width="2"/>' };
// white header icons of System Utilities: tools, help, search, language, refresh, devices
const RBI = ['<path d="M15.5 3.5a5 5 0 0 0-4.8 6.4L3.5 17.1l3.4 3.4 7.2-7.2a5 5 0 0 0 6.4-4.8l-3 3-3.2-.8-.8-3.2z" fill="#FFF"/>',
  '<path d="M8.4 8.2a3.7 3.7 0 1 1 5.4 3.3c-1.2.7-1.8 1.4-1.8 2.9v.9" fill="none" stroke="#FFF" stroke-width="2.1" stroke-linecap="round"/><circle cx="12" cy="19.6" r="1.4" fill="#FFF"/>',
  '<circle cx="10" cy="10" r="6" fill="none" stroke="#FFF" stroke-width="2.6"/><path d="M14.5 14.5l6 6" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>',
  '<circle cx="12" cy="12" r="9" fill="none" stroke="#FFF" stroke-width="1.6"/><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#FFF" stroke-width="1.4"/><path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" stroke="#FFF" stroke-width="1.3"/>',
  '<path d="M18.5 9A7 7 0 0 0 6 7.5M5.5 15A7 7 0 0 0 18 16.5" fill="none" stroke="#FFF" stroke-width="2"/><path d="M6 3.5V8h4.5M18 20.5V16h-4.5" fill="none" stroke="#FFF" stroke-width="2"/>',
  '<ellipse cx="10" cy="5.5" rx="6" ry="2.5" fill="none" stroke="#FFF" stroke-width="1.6"/><path d="M4 5.5v11c0 1.4 2.7 2.5 6 2.5M16 5.5v6" fill="none" stroke="#FFF" stroke-width="1.6"/><path d="M4 11c0 1.4 2.7 2.5 6 2.5" fill="none" stroke="#FFF" stroke-width="1.6"/><rect x="13.5" y="14" width="7" height="6.5" rx="1" fill="none" stroke="#FFF" stroke-width="1.6"/>'].map(p => SV('0 0 24 24', p)).join('');
const CHEV = SV('0 0 24 24', '<path d="M5 9l7 7 7-7" fill="none" stroke="#666" stroke-width="2.2"/>');
const CHEVW = SV('0 0 24 24', '<path d="M5 9l7 7 7-7" fill="none" stroke="#FFF" stroke-width="2.2"/>');
const LOCK = SV('0 0 24 24', '<rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="#777" stroke-width="1.8"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="#777" stroke-width="1.8"/>');
// a QR-like pattern for the help link (decoration: it encodes nothing)
const QR = (() => {
  const n = 25; let s = 11, g = '';
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue; if (rnd() < 0.47) g += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FFF"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="-2 -2 29 29" shape-rendering="crispEdges" aria-hidden="true"><rect x="-2" y="-2" width="29" height="29" fill="#FFF"/><g fill="#111">${f(0, 0)}${f(n - 7, 0)}${f(0, n - 7)}${g}</g></svg>`;
})();
// the server drawn at the top right of the POST screen
const SRVART = SV('0 0 204 132', `<defs><linearGradient id="srvG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0A3A2C"/><stop offset="1" stop-color="#2AD89A"/></linearGradient></defs>
<polygon points="10,52 160,24 198,34 48,64" fill="#1A2420"/>${Array.from({ length: 30 }, (_, k) => { const i = k % 10, j = Math.floor(k / 10); return `<rect x="${60 + i * 12 - j * 9}" y="${42 - i * 2.1 + j * 6}" width="7" height="3" fill="url(#srvG)" opacity="${(0.25 + i * 0.075).toFixed(2)}" transform="skewX(-20)"/>`; }).join('')}
<polygon points="10,52 48,64 48,106 10,92" fill="#2A3034"/><polygon points="48,64 198,34 198,72 48,106" fill="#3B4247"/><polygon points="58,70 186,44 186,66 58,94" fill="#272C30"/>
${Array.from({ length: 12 }, (_, k) => `<path d="M${64 + k * 10} ${69 - k * 2.05}v22" stroke="#4E565C" stroke-width="2"/>`).join('')}<polygon points="112,72 132,68 132,71 112,75" fill="#01A982"/>
${[0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${12 + k * 26}" y="${114}" width="${k % 3 ? 18 : 22}" height="9" fill="#22C28A" opacity="${(0.55 - k * 0.05).toFixed(2)}"/>`).join('')}`);

/* ============ the server's screen: power-on self-test, operating system ============ */
const POSTL = ['System Chipset Initialization', 'UPI Link Initialization - Start', 'UPI Link Initialization - Complete', 'Early Processor Initialization', 'Memory Initialization - Start', 'Memory Initialization - Complete',
  'Chipset Root Ports Initialization', 'USB Controller Initialization', 'TPM Measurement - Start', 'TPM Measurement - Complete', 'iLO Embedded Health Initialization', 'HPE Memory Initialization', 'SMBIOS Table Initialization',
  'ACPI Table Initialization', 'System Security Initialization', 'BIOS Configuration Initialization', 'Early PCI Initialization - Start', 'Early PCI Initialization - Complete'];
function startPost(t) { Object.assign(t.con, { mode: 'secure', t: Date.now(), boots: t.con.boots + 1 }); t.rb = newRb(); if (t.os) OSI.reset(t); }
// a restart while running (Ctrl+Alt+Del, Reset, Cold Boot, Reboot the System): POST again, and the fans rush up to full speed again
function rebootSrv(t) { startPost(t); Sim.sound('fans'); }
function conTick(t) {
  const c = t.con, e = ageOf(c.t), r = t.rb, ic = t.iloCfg;
  if (!isOn(t)) { c.mode = 'off'; if (t.os) OSI.down(t); }
  else if (c.mode === 'off') startPost(t);
  else if (c.mode === 'secure' && e >= CT.secure) Object.assign(c, { mode: 'post', t: Date.now() });
  else if (c.mode === 'post' && e >= CT.post) { Object.assign(c, { mode: 'summary', t: Date.now() }); if (t.crash && t.crash.vga) t.flags.sawPost = true; }
  else if (c.mode === 'summary' && e >= CT.win) Object.assign(c, { mode: 'boot', t: Date.now() });
  else if (c.mode === 'f9' && e >= CT.f9) { Object.assign(c, { mode: 'rbsu', t: Date.now() }); if (r.f11) { Object.assign(r, { path: ['home', 'otb'], started: true }); const it = rbItems(t, 'otb').find(rbSelectable); r.sel = it ? it.k : null; } }
  else if (c.mode === 'boot' && e >= CT.boot) { if (t.os) { const b = OSI.boot(t); c.mode = b === 'osi' ? 'osi' : b === 'old' ? 'os' : 'noboot'; } else c.mode = t.flags.hasOS ? 'os' : 'noboot'; }
  if (r.dlg && r.dlg.kind === 'starting' && ageOf(r.dlg.at) >= CT.start) { r.dlg = null; r.started = true; r.path.push('syscfg'); r.sel = 'bios'; }
  if (ic.resetAt && ageOf(ic.resetAt) >= CT.reset) {
    ic.resetAt = 0; t.flags.iloUp = true;
    if (t.ilo.page === 'reset') Object.assign(t.ilo, t.net === 'mgmt' && t.ilo.host !== liveIp(t) ? { page: 'noreach', msg: `${t.ilo.host} took too long to respond.` } : { page: 'login', msg: 'iLO was reset and your session ended. Log in again.' });
  }
}
function postBanner(pct) {
  return `<div class="band"></div><div class="ptl">HPE ProLiant</div><div class="pbar"><i style="width:${pct.toFixed(1)}%"></i></div><div class="hl"><i></i><b>Hewlett Packard</b><em>Enterprise</em></div><div class="srv">${SRVART}</div>`;
}
const ipLines = t => `<div class="tx" style="top:${UU(606)}">iLO 6 IPv4: <span class="c">${liveIp(t)}</span>\niLO 6 IPv6: <span class="c">${LAB.ll}</span></div>`;
function conScreen(t) {
  const c = t.con, e = ageOf(c.t);
  switch (c.mode) {
    case 'off': return `<div class="cc"><div class="nov">${Sim.view === 'console' ? 'No signal: the server is powered off.<br>Press the Power On/Standby button on the front.' : 'No video: the server is powered off.<br>Use the console menu, Power, to power it on.'}</div></div>`;
    case 'secure': return `<div class="cc"><div class="tx y" style="top:${UU(372)};font-size:${UU(16.5)}">Secure Start verification in progress. This may take a few seconds...</div></div>`;
    case 'post': {
      const n = Math.min(POSTL.length, 1 + Math.floor(e / (CT.post / POSTL.length)));
      const L = [`HPE ProLiant System BIOS ${ROM}`, '(C) Copyright 1982-2025 Hewlett Packard Enterprise Development LP', 'Early system initialization, please wait...', '', ...POSTL.slice(0, n)];
      return `<div class="cc">${postBanner(4 + 56 * Math.min(1, e / CT.post))}<div class="tx" style="top:${UU(124)}">${L.map(esc).join('\n')}</div>${ipLines(t)}</div>`;
    }
    case 'summary': case 'f9': {
      const mem = memGB(t), np = cpuCount(t);
      const L = ['(C) Copyright 1982-2025 Hewlett Packard Enterprise Development LP', `HPE ${PROFILE.product}`, `System ROM Version: ${ROM}`, `Serial Number: ${LAB.serial}`, '',
        `Installed System Memory: ${mem} GB, Available System Memory: ${Math.max(0, mem - 1)} GB`, '',
        `${np} Processor(s) detected, ${np * CATALOG.cpu.cores} total cores enabled, Hyperthreading is enabled`, ...Array.from({ length: np }, (_, k) => `Proc ${k + 1}: ${cpuFull()}`), 'UPI Speed: 16 GT/s', '',
        'Workload Profile: General Power Efficient Compute', 'Power Regulator Mode: Dynamic Power Savings', 'Advanced Memory Protection Mode: Advanced ECC Support', 'RAS Mode: Firmware First', 'Secure Boot: Disabled', 'Server Configuration Lock: Disabled', 'HPE Memory authenticated in all populated DIMM slots.', '',
        c.mode === 'f9' ? 'System Utilities: starting, please wait...' : 'Starting required devices. Please wait, this may take a few moments...'];
      const k9 = c.mode === 'f9' ? ' on' : '';
      return `<div class="cc">${postBanner(c.mode === 'f9' ? 30 : 6 + 10 * Math.min(1, e / CT.win))}<div class="tx" style="top:${UU(127)}">${L.map(esc).join('\n')}</div>${ipLines(t)}<div class="fk"><b class="${k9.trim()}">F9</b><span>System Utilities</span><b>F10</b><span>Intelligent Provisioning</span><b>F11</b><span>Boot Menu</span><b>F12</b><span>Network Boot</span></div></div>`;
    }
    case 'rbsu': return rbScreen(t);
    case 'boot': { const pk = OSI.peek(t); return `<div class="cc"><div class="tx os">${pk === 'cd' ? 'Booting from iLO Virtual USB 3 : iLO Virtual CD-ROM...' : pk === 'disk' ? `Booting from the HPE NS204i-u Gen11 Boot Controller...\n\nLoading ${t.os.sys.os === 'old' ? 'Rocky Linux 9.5 (Blue Onyx)' : OSI.meta(t.os.sys.os).pretty}...` : pk === 'none' ? 'Attempting to boot from the boot devices...' : t.flags.hasOS ? 'Booting from the HPE NS204i-u Gen11 Boot Controller...\n\nLoading Rocky Linux 9.5 (Blue Onyx)...' : 'Attempting to boot from the boot devices...'}</div></div>`; }
    case 'osi': return `<div class="cc">${OSI.screen(t)}</div>`;
    case 'os': return `<div class="cc"><div class="tx os">Rocky Linux 9.5 (Blue Onyx)\nKernel 5.14.0-503.14.1.el9_5.x86_64 on an x86_64\n\nActivate the web console with: systemctl enable --now cockpit.socket\n\n${LAB.host} login: _</div></div>`;
    default: return `<div class="cc"><div class="tx os">No bootable device was found.\nInstall an operating system, or set the boot order in System Utilities (F9 at POST).\n_</div></div>`;
  }
}
const postCode = t => { const c = t.con, e = ageOf(c.t); return { secure: '0010', post: e < CT.post / 2 ? '0010' : '002F', summary: '002F', f9: '0040', rbsu: t.rb.dlg && t.rb.dlg.kind === 'starting' ? '0040' : '0038' }[c.mode] || ''; };

/* ============ System Utilities (F9) and the iLO 6 Configuration Utility ============ */
const RBT = { home: 'System Utilities', otb: 'One-Time Boot Menu', syscfg: 'System Configuration', ilocfg: 'iLO 6 Configuration Utility', net: 'Network Options', users: 'User Management', edit: 'Edit/Remove User', add: 'Add User' };
const RBPAR = { otb: 'home', syscfg: 'home', ilocfg: 'syscfg', net: 'ilocfg', users: 'ilocfg', edit: 'users', add: 'users' };
const RBSTUB = { otb: 'One-Time Boot Menu', emb: 'Embedded Applications', sinfo: 'System Information', shealth: 'System Health', bios: 'BIOS/Platform Configuration (RBSU)', ocp14: 'OCP Slot 14 : HPE MR416i-o Gen11',
  ocp15a: 'OCP Slot 15 Port 1 : Broadcom NetXtreme-E Dual 10Gb SFP+ OCP 3.0 Ethernet - NIC', ocp15b: 'OCP Slot 15 Port 2 : Broadcom NetXtreme-E Dual 10Gb SFP+ OCP 3.0 Ethernet - NIC', ns204: 'Storage Slot 16 : HPE NS204i-u Gen11 Boot Controller',
  adv: 'Advanced Network Options', settings: 'Setting Options', about: 'About' };
const rbPage = r => r.path[r.path.length - 1];
const rbChain = p => p === 'home' ? ['home'] : [...rbChain(RBPAR[p]), p];
const rbFs = r => r.path.length >= 3 && !!r.form;     // inside the iLO 6 Configuration Utility, with its pending changes
function rbEdit(t, i) { const r = t.rb, u = t.iloCfg.users[i]; return r.edit[i] || { act: 'No Change', name: u.name, login: u.login, pw: '', priv: { ...u.priv } }; }
function rbItems(t, page) {
  const r = t.rb, L = k => ({ k, type: 'link', l: RBT[k] || RBSTUB[k] }), S = (k, l, o) => ({ k, type: 'sel', l, o }), X = (k, l, ro) => ({ k, type: 'text', l, ro }), P = (k, l) => ({ k, type: 'pw', l }), R = (k, l) => ({ k, type: 'ro', l }), G = { type: 'gap' };
  const privRows = pre => PRIVS.map(([k, l]) => S(pre + k, l, ['YES', 'NO']));
  switch (page) {
    case 'home': return [L('syscfg'), L('otb'), L('emb'), L('sinfo'), L('shealth'), G, { k: 'exitBoot', type: 'act', l: 'Exit and resume system boot' }, { k: 'reboot', type: 'act', l: 'Reboot the System' }, G, S('lang', 'Select Language', ['English']), S('browser', 'Setup Browser Selection', ['Auto', 'GUI', 'Text'])];
    case 'syscfg': return ['bios', 'ilocfg', 'ocp14', 'ocp15a', 'ocp15b', 'ns204'].map(L);
    case 'otb': return [...(t.os ? OSI.bootList(t) : t.flags.hasOS ? [{ id: 'disk', label: 'Rocky Linux' }] : []).map(b => ({ k: 'otb:' + b.id, type: 'act', l: b.label })), { k: 'otb:usb', type: 'act', l: 'Generic USB Boot' }, { k: 'otb:pxe', type: 'act', l: 'OCP Slot 15 Port 1 : Broadcom NetXtreme-E Dual 10Gb SFP+ OCP 3.0 Ethernet - NIC (PXE IPv4)' }, { k: 'otb:shell', type: 'act', l: 'Embedded UEFI Shell' }, G, { k: 'otb:app', type: 'act', l: 'Run a UEFI application from a file system' }];
    case 'ilocfg': return [L('net'), L('adv'), L('users'), L('settings'), S('factory', 'Set to factory defaults', ['NO', 'YES']), S('resetIlo', 'Reset iLO', ['NO', 'YES']), L('about')];
    case 'net': {
      const f = r.form, it = [R('mac', 'MAC Address'), S('nic', 'Network Interface Adapter', ['ON', 'Shared Network Port', 'OFF']), S('autoSpeed', 'Transceiver Speed Autoselect', ['ON', 'OFF'])];
      if (f.autoSpeed === 'OFF') it.push(S('speed', 'Transceiver Speed Manual Setting', ['10 Mbps', '100 Mbps', '1000 Mbps']), S('duplex', 'Transceiver Duplex Setting', ['Full', 'Half']));
      it.push(S('vlan', 'VLAN Enable', ['OFF', 'ON']));
      if (f.vlan === 'ON') it.push(X('vlanId', 'VLAN ID'));
      it.push(G, S('dhcp', 'DHCP Enable', ['ON', 'OFF']), X('dns', 'DNS Name'), G, X('ip', 'IP Address', f.dhcp === 'ON'), X('mask', 'Subnet Mask', f.dhcp === 'ON'), X('gw', 'Gateway IP Address', f.dhcp === 'ON'));
      return it;
    }
    case 'users': return [L('add'), L('edit')];
    case 'edit': return t.iloCfg.users.flatMap((u, i) => {
      const e = rbEdit(t, i), rows = [e.act === 'Edit' ? X(`u${i}name`, `${i + 1}. User Name`) : R(`u${i}name`, `${i + 1}. User Name`), S(`u${i}act`, 'Action', ['No Change', 'Delete', 'Edit'])];
      if (e.act === 'Edit') rows.push(X(`u${i}login`, 'Login Name'), P(`u${i}pw`, 'Password'), ...privRows(`u${i}p:`));
      return rows;
    });
    case 'add': return [X('newName', 'New User Name'), X('newLogin', 'Login Name'), P('newPw', 'Password'), ...privRows('np:')];
  }
  return [];
}
const rbSelectable = it => it.k && it.type !== 'ro' && !(it.type === 'text' && it.ro);
function rbVal(t, k) {
  const r = t.rb; let m;
  if (k === 'mac') return LAB.mac;
  if (r.form && k in NET0) return r.form[k];
  if ((m = /^u(\d+)(name|act|login|pw)$/.exec(k))) return rbEdit(t, +m[1])[m[2]];
  if ((m = /^u(\d+)p:(\w+)$/.exec(k))) return rbEdit(t, +m[1]).priv[m[2]];
  if (k === 'newName') return r.add.name; if (k === 'newLogin') return r.add.login; if (k === 'newPw') return r.add.pw;
  if ((m = /^np:(\w+)$/.exec(k))) return r.add.priv[m[1]];
  return r.misc[k];
}
function rbSet(t, k, v) {
  const r = t.rb; let m;
  if (r.form && k in NET0) { r.form[k] = v; r.pend = true; return; }
  if ((m = /^u(\d+)(name|act|login|pw)$/.exec(k))) { const i = +m[1]; r.edit[i] = Object.assign(rbEdit(t, i), { [m[2]]: v }); r.pend = true; return; }
  if ((m = /^u(\d+)p:(\w+)$/.exec(k))) { const i = +m[1], e = rbEdit(t, i); e.priv = Object.assign({}, e.priv, { [m[2]]: v }); r.edit[i] = e; r.pend = true; return; }
  if (k === 'newName' || k === 'newLogin' || k === 'newPw') { r.add[{ newName: 'name', newLogin: 'login', newPw: 'pw' }[k]] = v; r.pend = true; return; }
  if ((m = /^np:(\w+)$/.exec(k))) { r.add.priv[m[1]] = v; r.pend = true; return; }
  r.misc[k] = v; if (k === 'factory' || k === 'resetIlo') r.pend = true;
}
// open the iLO 6 Configuration Utility: its pending changes start from the saved settings
function rbInit(t) { const r = t.rb; Object.assign(r, { form: { ...t.iloCfg.net }, edit: {}, add: newAdd(), pend: false }); r.misc.factory = 'NO'; r.misc.resetIlo = 'NO'; }
function rbNav(t, n) {
  const r = t.rb; r.path = r.path.slice(0, n + 1); r.open = null;
  if (r.path.length < 3) { r.form = null; r.edit = {}; r.add = newAdd(); r.pend = false; }
  const first = rbItems(t, rbPage(r)).find(rbSelectable); r.sel = first ? first.k : null;
  if (n === 2) r.sel = 'net';
}
function rbLeave(t, n) { const r = t.rb; if (n < 2 && r.path.length > 2 && r.pend) { r.dlg = { kind: 'q', to: n }; return; } rbNav(t, n); }
function rbBack(t) {
  const r = t.rb;
  if (r.dlg) { if (!['starting', 'reset'].includes(r.dlg.kind)) r.dlg = null; return; }
  if (r.open) { r.open = null; return; }
  if (r.path.length === 1) return say('info', 'System Utilities is the top level. To leave it, click Exit and resume system boot, or Reboot the System.');
  rbLeave(t, r.path.length - 2);
}
function rbUsersAfter(t) {
  const r = t.rb, out = [];
  t.iloCfg.users.forEach((u, i) => { const e = r.edit[i]; if (!e || e.act === 'No Change') out.push(u); else if (e.act === 'Edit') out.push({ name: String(e.name).trim(), login: String(e.login).trim(), pw: e.pw || u.pw, priv: { ...e.priv } }); });
  const a = r.add;
  if (a.name || a.login || a.pw) { if (!a.name.trim() || !a.login.trim() || !a.pw) return 'Add User: fill in the New User Name, the Login Name and the Password.'; out.push({ name: a.name.trim(), login: a.login.trim(), pw: a.pw, priv: { ...a.priv } }); }
  return out;
}
// a static IPv4 setting: '' when valid, otherwise what is wrong
function ipErr(f, L = { ip: 'IP Address', mask: 'Subnet Mask', gw: 'Gateway IP Address' }) {
  const ip = ipNum(f.ip), mask = ipNum(f.mask), gw = ipNum(f.gw);
  if (ip === null || ip === 0) return `${L.ip}: "${f.ip}" is not a valid IPv4 address.`;
  if (!maskOk(mask)) return `${L.mask}: "${f.mask}" is not a valid subnet mask. For a /24 network it is 255.255.255.0.`;
  if (gw === null) return `${L.gw}: "${f.gw}" is not a valid IPv4 address.`;
  if (gw !== 0 && ((ip & mask) >>> 0) !== ((gw & mask) >>> 0)) return 'The gateway is not in the same subnet as the IP address.';
  if (ip === gw) return 'The IP address and the gateway are the same address.';
  const hb = (ip & ~mask) >>> 0; if (hb === 0 || hb === ((~mask) >>> 0)) return 'That IP address is the network or broadcast address of its subnet.';
  return '';
}
function rbCheck(t) {
  const r = t.rb, f = r.form;
  if (r.misc.factory === 'YES') return 'Set to factory defaults is YES: saving would erase every iLO setting and account. Set it back to NO.';
  if (f) {
    if (f.dhcp === 'OFF') { const e = ipErr(f); if (e) return e; }
    if (f.vlan === 'ON' && !(+f.vlanId >= 1 && +f.vlanId <= 4094)) return 'VLAN ID: enter a number from 1 to 4094.';
    if (!/^[A-Za-z0-9]([A-Za-z0-9-]{0,47}[A-Za-z0-9])?$/.test(String(f.dns || '').trim())) return 'DNS Name: letters, digits and hyphens only, up to 49 characters.';
  }
  const list = rbUsersAfter(t); if (typeof list === 'string') return list;
  const seen = {};
  for (const u of list) { const k = u.login.toLowerCase(); if (!u.name) return 'User Name cannot be empty.'; if (!u.login) return 'Login Name cannot be empty.'; if (seen[k]) return `The login name "${u.login}" is used twice.`; seen[k] = 1; }
  if (!list.some(u => u.priv.admin === 'YES' && u.priv.login === 'YES')) return 'At least one account must keep the Login and Administer User Accounts privileges.';
  return '';
}
// save the pending changes; returns { reset } (the network settings changed, so iLO must reset) or null on an error
function rbCommit(t) {
  const r = t.rb, err = rbCheck(t);
  if (err) { r.dlg = { kind: 'msg', err: true, title: 'Error', text: err }; bad(err); return null; }
  const c = t.iloCfg;
  if (r.form) c.net = { ...r.form };
  c.users = rbUsersAfter(t);
  const reset = JSON.stringify(c.net) !== JSON.stringify(c.live) || r.misc.resetIlo === 'YES';
  Object.assign(r, { edit: {}, add: newAdd(), pend: false }); r.misc.resetIlo = 'NO'; if (r.form) r.form = { ...c.net };
  t.flags.saved = true;
  return { reset };
}
function iloReset(t) {
  const c = t.iloCfg; c.oldIp = liveIp(t); c.live = { ...c.net }; c.resetAt = Date.now(); c.resets++;
  t.flags.iloUp = false; t.rb.dlg = null;
  Object.assign(t.ilo, { auth: false, rc: false, menu: null, usel: null, ue: null, wf: null, dlg: null, page: ['shell', 'login'].includes(t.ilo.page) ? 'reset' : t.ilo.page });
}
function rbRows(t) {
  const r = t.rb, items = rbItems(t, rbPage(r)); let i = 0;
  return items.map(it => {
    if (it.type === 'gap') return '<div class="rr gap"></div>';
    const y = 126 + 62 + (++i) * 30.6, sel = r.sel === it.k, v = rbVal(t, it.k);
    const lab = it.type === 'link' || it.type === 'act' ? `<button class="lb lnk${sel ? ' sel' : ''}" data-act="rbGo" data-arg="${it.k}"><span>${esc(it.l)}</span>${it.type === 'link' ? '<i class="ld"></i>' : ''}</button>`
      : `<button class="lb${sel ? ' sel' : ''}" data-act="rbSel" data-arg="${esc(it.k)}">${esc(it.l)}</button>`;
    let ctl = '';
    if (it.type === 'sel') {
      const open = r.open === it.k, up = y + it.o.length * 24 > 690;
      ctl = `<div class="ctl"><button class="dd${sel ? ' on' : ''}" data-act="rbOpen" data-arg="${esc(it.k)}" aria-haspopup="listbox" aria-expanded="${open}" aria-label="${esc(it.l)}: ${esc(v)}">${esc(v)}${sel ? CHEVW : CHEV}</button>${open ? `<div class="pop${up ? ' up' : ''}" role="listbox">${it.o.map(o => `<button class="${o === v ? 'cur' : ''}" role="option" data-act="rbPick" data-arg="${esc(it.k + '=' + o)}">${esc(o)}</button>`).join('')}</div>` : ''}</div>`;
    } else if (it.type === 'text') ctl = `<div class="ctl">${it.ro ? `<span class="tf ro">${esc(v)}</span>` : `<input class="tf" data-field="rb:${esc(it.k)}" value="${esc(v)}" autocomplete="off" spellcheck="false" aria-label="${esc(it.l)}">`}</div>`;
    else if (it.type === 'ro') ctl = `<div class="ctl"><span class="tf ro">${esc(v)}</span></div>`;
    else if (it.type === 'pw') ctl = `<div class="ctl"><button class="tf" data-act="rbPw" data-arg="${esc(it.k)}" aria-label="${esc(it.l)}">${v ? '&#8226;'.repeat(10) : '<span class="ph">Press ENTER to input password</span>'}${LOCK}</button></div>`;
    return `<div class="rr">${lab}${ctl}</div>`;
  }).join('');
}
function rbDialog(t) {
  const d = t.rb.dlg; if (!d) return '';
  const head = (title, x = true) => `<div class="dh">${title ? esc(title) : '<i></i>'}${x ? '<button class="x" data-act="rbDlg" data-arg="cancel" aria-label="Close">&times;</button>' : ''}</div>`;
  const btn = (arg, l, pri) => `<button class="${pri ? 'pri' : ''}" data-act="rbDlg" data-arg="${arg}">${esc(l)}</button>`;
  let h;
  if (d.kind === 'starting') { const p = Math.min(100, ageOf(d.at) / CT.start * 100); h = `${head('Starting devices', false)}<div class="db"><div><p>Starting all devices for entering System Configuration. Please wait...</p><div class="pg"><i style="width:${p.toFixed(0)}%"></i></div></div></div>`; }
  else if (d.kind === 'q') h = `${head('')}<div class="db"><span class="qi">?</span><div><h5>Question</h5><p>Changes are pending. Do you want to save changes?</p></div></div><div class="bt">${btn('yes', 'Yes - Save Changes', 1)}${btn('no', 'No - Discard Changes')}${btn('cancel', 'Cancel')}</div>`;
  else if (d.kind === 'reset') h = `${head('', false)}<div class="db"><span class="qi">i</span><div><h5>Information</h5><p>iLO 6 must be reset for the network settings to take effect. ${t.ilo.rc && Sim.view === 'web' ? 'iLO resets now: its sessions end, this remote console too. You can reconnect in about 30 seconds.' : 'iLO resets now: its network sessions end. This monitor and keyboard are not affected: the server keeps running in System Utilities.'}</p></div></div><div class="bt">${btn('ok', 'OK', 1)}</div>`;
  else if (d.kind === 'msg') h = `${head('')}<div class="db"><span class="qi${d.err ? ' e' : ''}">${d.err ? '!' : 'i'}</span><div><h5>${esc(d.title)}</h5><p>${esc(d.text)}</p></div></div><div class="bt">${btn('ok', 'OK', 1)}</div>`;
  else if (d.kind === 'pw') h = `${head('Password')}<div class="db"><div><label>Enter Password</label><input type="password" data-field="rb:pw1" value="${esc(d.pw1 || '')}" autocomplete="off" aria-label="Enter Password"><label>Confirm Password</label><input type="password" data-field="rb:pw2" data-enter="rbPwOk" value="${esc(d.pw2 || '')}" autocomplete="off" aria-label="Confirm Password"><div class="er">${esc(d.err || '')}</div></div></div><div class="bt">${btn('ok', 'OK', 1)}${btn('cancel', 'Cancel')}</div>`;
  else if (d.kind === 'exitBoot' || d.kind === 'reboot') h = `${head('')}<div class="db"><span class="qi">?</span><div><h5>Question</h5><p>${d.kind === 'exitBoot' ? 'Exit System Utilities and resume the system boot?' : 'Reboot the system now? Changes that are not saved are lost.'}</p></div></div><div class="bt">${btn('ok', 'OK', 1)}${btn('cancel', 'Cancel')}</div>`;
  return `<div class="dl"><div class="dw" role="dialog" aria-label="System Utilities dialog">${h}</div></div>`;
}
function rbScreen(t) {
  const r = t.rb, page = rbPage(r), fs = r.path.length >= 3, ip = liveIp(t);
  // breadcrumb: the last three pages after "More Forms" when the path is deep
  const crumbs = r.path.map((p, i) => [p, i]), shown = crumbs.length > 4 ? crumbs.slice(-3) : crumbs;
  const chev = SV('0 0 22 50', '<path d="M2 0l17 25L2 50" fill="none" stroke="#C9D1D8" stroke-width="1.5"/>').replace('<svg', '<svg class="chev" preserveAspectRatio="none"');
  const cr = (crumbs.length > 4 ? `<button data-act="rbCrumb" data-arg="${crumbs.length - 4}">${SV('0 0 24 24', '<path d="M4 6h16M4 12h16M4 18h16" stroke="#FFF" stroke-width="2"/>').replace('<svg', '<svg class="hm"')}More Forms${chev}</button>` : '') +
    shown.map(([p, i]) => `<button class="${i === r.path.length - 1 ? 'cur' : ''}" data-act="rbCrumb" data-arg="${i}">${p === 'home' ? SV('0 0 24 24', '<path d="M12 3 2 12h3v9h5v-6h4v6h5v-9h3z" fill="#FFF"/>').replace('<svg', '<svg class="hm"') : ''}${esc(RBT[p])}${chev}</button>`).join('');
  return `<div class="cc rb"><div class="h"><span class="lg"><i></i>Hewlett Packard<em>Enterprise</em></span><span class="tt">${r.path.length === 1 ? 'System Utilities' : page === 'otb' ? 'One-Time Boot Menu' : 'System Configuration'}</span><span class="ics">${RBI}</span></div>
<div class="cr">${cr}</div>
<div class="l1"><b>HPE</b><b>${PROFILE.product}</b><p>Server SN: ${LAB.serial}<br>iLO IPv4: ${ip}<br>iLO IPv6: ${LAB.ll}<br>User Default: OFF<br>Secure Boot: Disabled<br>System ROM: ${ROM}</p></div>
<div class="l2"><table><tr><td>Enter:</td><td>Select</td></tr><tr><td>ESC:</td><td>Exit</td></tr><tr><td>F1:</td><td>Help</td></tr><tr><td>F7:</td><td>Load Defaults</td></tr><tr><td>F10:</td><td>Save</td></tr><tr><td>F12:</td><td>Save and Exit</td></tr></table><span class="qr">${QR}</span><small>http://www.hpe.com/support/UEFIGen11-UG-en</small></div>
<div class="m"><h4>${esc(RBT[page])}</h4>${rbRows(t)}</div>
<div class="b"><button class="bx" data-act="rbBack" data-arg="">Exit</button><span class="rd rb-pend${r.pend ? ' on' : ''}"><i></i>Changes Pending</span><span class="rd"><i></i>Reboot Required</span><span class="sp"></span>${[['F7', 'F7: Load Defaults'], ['F10', 'F10: Save'], ['F12', 'F12: Save and Exit']].map(([k, l]) => `<button class="bx${fs ? '' : ' dim'}" data-act="rcKey" data-arg="${k}">${l}</button>`).join('')}</div>${rbDialog(t)}</div>`;
}

/* ============ the iLO 6 web interface ============ */
const NAV = [['info', 'Information'], ['sys', 'System Information'], ['cop', 'HPE Compute Ops Management'], ['fw', 'Firmware & OS Software'], ['fed', 'iLO Federation'], ['rcm', 'Remote Console & Media'], ['pt', 'Power & Thermal'], ['perf', 'Performance'],
  ['dnp', 'iLO Dedicated Network Port'], ['snp', 'iLO Shared Network Port'], ['rs', 'Remote Support'], ['adm', 'Administration'], ['sec', 'Security'], ['mgmt', 'Management'], ['lcm', 'Lifecycle Management']];
const SUBS = {
  info: [['overview', 'Overview'], ['secdash', 'Security Dashboard'], ['sess', 'Session List'], ['iel', 'iLO Event Log'], ['iml', 'Integrated Management Log'], ['seclog', 'Security Log'], ['ahs', 'Active Health System Log'], ['diag', 'Diagnostics']],
  sys: [['summary', 'Summary'], ['proc', 'Processors'], ['mem', 'Memory'], ['net', 'Network'], ['dev', 'Device Inventory'], ['stor', 'Storage']],
  rcm: [['launch', 'Launch'], ['vm', 'Virtual Media'], ['hot', 'Hot Keys'], ['rsec', 'Security']],
  dnp: [['summary', 'Summary'], ['general', 'General'], ['ipv4', 'IPv4'], ['ipv6', 'IPv6'], ['sntp', 'SNTP']],
  adm: [['users', 'User Management'], ['dir', 'Directory Groups'], ['boot', 'Boot Order'], ['lic', 'Licensing'], ['key', 'Key Manager'], ['lang', 'Language']],
};
const PSHORT = { login: 'Login', admin: 'User Accounts', rc: 'Remote Console', vpr: 'Virtual Power and Reset', vm: 'Virtual Media', cfg: 'iLO Settings', bios: 'Host BIOS', nic: 'Host NIC', stor: 'Host Storage', rec: 'Recovery Set' };
const curSub = c => (c.subs && c.subs[c.nav]) || (SUBS[c.nav] ? SUBS[c.nav][0][0] : '');
const navLabel = id => (NAV.find(n => n[0] === id) || [0, id])[1];
const subLabel = (nav, sub) => ((SUBS[nav] || []).find(s => s[0] === sub) || [0, ''])[1];
function pageTitle(nav, sub) {
  if (nav === 'info') return sub === 'overview' ? 'Information - iLO Overview' : 'Information - ' + subLabel(nav, sub);
  if (nav === 'dnp') return 'iLO Dedicated Network Port - ' + (sub === 'summary' ? 'Network Summary' : subLabel(nav, sub));
  return SUBS[nav] ? `${navLabel(nav)} - ${subLabel(nav, sub)}` : navLabel(nav);
}
const notSim = what => `<div class="note">${esc(what)}: this page is not part of the simulation yet.</div>`;
function overview(t) {
  const n = t.iloCfg.live, on = isOn(t), ok = !t.bays.some(b => b.health === 'fault');
  const R = (k, v, act) => `<div class="i6r"><span class="k">${act ? `<button class="lk" data-act="${act[0]}" data-arg="${act[1]}">${k}</button>` : k}</span><span class="v">${v}</span></div>`;
  const ST = (ic, s) => `<span class="st">${ic}${s}</span>`, nv = id => ['iloNav', id], nt = k => ['iloNote', k];
  const ams = t.os && t.os.scr === 'sys' && t.os.sys && t.os.sys.os === 'esxi' && t.os.m.e_apply;
  const srv = [R('Product Name', PROFILE.product), R('Server Name', ams ? esc(osH().net.host) : '[Not set]', nt('Server Name')), R('System ROM', ROM), R('System ROM Date', '01/17/2025'), R('Redundant System ROM', ROM), R('Server Serial Number', LAB.serial),
    R('Product ID', PROFILE.productId), R('UUID', LAB.uuid), R('Remote Console', `<button class="vl" data-act="rcOpen" data-arg="">HTML5</button> <span class="st">${ICO.ext}</span> <span class="vl">.NET</span>`, nv('rcm'))];
  const ilo = [R('IP Address', liveIp(t), nv('dnp')), R('Link-Local IPv6 Address', LAB.ll, nv('dnp')), R('iLO Hostname', esc(n.dns), nv('dnp')), R('iLO Dedicated Network Port', n.nic === 'ON' ? 'Enabled' : 'Disabled', nv('dnp')),
    R('iLO Shared Network Port', n.nic === 'Shared Network Port' ? 'Enabled' : 'Disabled', nv('snp')), R('iLO Virtual NIC', 'Disabled', nt('iLO Virtual NIC')), R('License Type', t.iloLic || 'iLO Standard', nt('License Type')), R('iLO Firmware Version', ILOFW, nv('fw')), R('iLO Date/Time', nowStr(), nt('iLO Date/Time'))];
  const sta = [R('Server Health', ok ? ST(ICO.check(), 'OK') : ST(ICO.warn, 'Degraded'), nv('sys')), R('Health LED', ok ? ST(ICO.check(), 'OK') : ST(ICO.warn, 'Degraded'), nt('Health LED')), R('iLO Health', ST(ICO.check(), 'OK'), nt('iLO Health')),
    R('iLO Security', ST(ICO.shield, 'Risk'), nv('sec')), R('Server Power', ST(ICO.dot(on ? G6 : '#A9B0B6'), on ? 'ON' : 'OFF'), nv('pt')), R('UID Indicator', ST(ICO.uid(t.uid), t.uid ? 'UID ON' : 'UID OFF')), R('Platform RAS Policy', 'Firmware First'),
    R('Trusted Platform Module', 'Present: Enabled'), R('Module Type', 'TPM 2.0'), R('microSD Flash Memory Card', 'Not Supported'), R('Connection to HPE', ST(ICO.warn, '<u>Not registered</u>'), nv('rs')), R('AMS', ams ? ST(ICO.check(), 'Available') : ST(ICO.info, 'Not available'))];
  return `<div class="i6cols"><div class="i6col"><h5>Server</h5>${srv.join('')}</div><div class="i6col"><h5>iLO</h5>${ilo.join('')}</div><div class="i6col"><h5>Status</h5>${sta.join('')}</div></div>
<h6>HPE Compute Ops Management</h6><div class="i6r" style="max-width:560px"><span class="k">Connection Status</span><span class="v"><span class="st">${ICO.minus}<u>Not Enabled</u></span></span></div>`;
}
function sysPage(t, sub) {
  if (sub === 'net' || sub === 'dev') return notSim(subLabel('sys', sub));
  if (!t.posted && sub !== 'summary') return `<div class="note">Information unavailable: the server has not completed POST since power was applied. Power the server on, then refresh.</div>`;
  const dotc = s => /OK|Good/.test(s) ? '#01A982' : s === 'Unknown' ? '#9AA7B1' : s === 'Failed' ? '#D03B2F' : '#E5A100';
  if (sub === 'summary') {
    const vs = volState(t).st;
    return `<table><tr><th>Subsystems and devices</th><th>Status</th></tr>${[['Processors', !t.posted ? 'Unknown' : cpuBad(t) ? 'Degraded' : 'OK'], ['Memory', t.posted ? 'OK' : 'Unknown'], ['Storage', !t.posted ? 'Unknown' : vs === 'OK' ? 'OK' : 'Degraded'], ['Power supplies', t.ac.ps1 && t.ac.ps2 ? 'OK, redundant' : 'Not redundant'], ['Fans', isOn(t) ? 'OK, redundant' : 'Unknown'], ['Network', 'OK']].map(([a, s]) => `<tr><td>${a}</td><td><span class="dot" style="background:${dotc(s)}"></span>${s}</td></tr>`).join('')}</table>`;
  }
  if (sub === 'proc') { const n = cpuCount(t), c2 = CATALOG.cpu; return `<table><tr><th>Processor</th><th>Model</th><th>Cores</th><th>Speed</th><th>Status</th></tr>${[1, 2].map(k => k <= n ? `<tr><td>Proc ${k}</td><td>${cpuFull()}</td><td>${c2.cores}</td><td>${c2.ghz * 1000} MHz</td><td>${k === 2 && cpuBad(t) ? '<span class="dot" style="background:#D03B2F"></span>Failed: uncorrectable error' : '<span class="dot" style="background:#01A982"></span>OK'}</td></tr>` : `<tr><td>Proc ${k}</td><td colspan="3">Not installed</td><td>Absent</td></tr>`).join('')}</table>`; }
  if (sub === 'mem') {
    const ids = Object.keys(t.dimms).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const per = [1, 2].filter(k => k <= cpuCount(t)).map(k => { const sl = procSlots(t, 'P' + k), n = sl.length, gb = sl.reduce((s, x) => s + dimmOf(t, `P${k}-${x}`).cap, 0); return `<span>Processor ${k}</span><span>${n} DIMM${n === 1 ? '' : 's'}, ${gb} GB${n ? ` (slot${n > 1 ? 's' : ''} ${procSlots(t, 'P' + k).join(', ')}), ${n > 8 ? '4400 MT/s (two DIMMs per channel)' : '4800 MT/s'}` : ''}</span>`; }).join('');
    return `<div class="kv" style="margin-bottom:10px"><span>Total system memory</span><span><b>${memGB(t)} GB</b></span><span>Memory modules</span><span>${Object.keys(DIMMK).map(k => [k, ids.filter(id => dimmKind(t.dimms[id]) === k).length]).filter(([, n]) => n).map(([k, n]) => `${n} x ${DIMMK[k].short}`).join(', ') || 'None'}</span>${per}<span>Advanced Memory Protection</span><span>Advanced ECC Support</span></div><table><tr><th>Location</th><th>Size</th><th>Type</th><th>Part number</th><th>Status</th></tr>${ids.map(id => `<tr><td>PROC ${id[1]} DIMM ${id.split('-')[1]}</td><td>${dimmOf(t, id).cap * 1024} MB</td><td>${dimmOf(t, id).type}</td><td>${dimmOf(t, id).pid}</td><td><span class="dot" style="background:#01A982"></span>Good, in use</td></tr>`).join('')}</table>`;
  }
  return storPage(t);
}
/* ---- System Information, Storage: the two storage devices this server has (System Configuration, F9): the HPE
   MR416i-o Gen11 controller in OCP slot 14, cabled to the 24 SFF front bays, and the HPE NS204i-u Gen11 boot device in
   storage slot 16 with two 480 GB NVMe M.2 SSDs in RAID 1 (the operating system). The front drives are read from the
   bays: a drive in Volume 1 (its members), an unconfigured new drive, a failed, missing or rebuilding member. ---- */
const present = b => b.st === 'drive' || b.st === 'open';
const bayLoc = i => `Box ${Math.floor(i / 8) + 1}, Bay ${(i % 8) + 1}`;
function volState(t) {
  const m = t.vol.members, miss = m.filter(i => !present(t.bays[i])), fail = m.filter(i => present(t.bays[i]) && t.bays[i].health === 'fault'), reb = m.filter(i => present(t.bays[i]) && t.bays[i].health === 'rebuild');
  const st = fail.length || miss.length ? 'Degraded' : reb.length ? `Rebuilding, ${Math.min(...reb.map(i => t.bays[i].pct))}%` : 'OK';
  return { st, miss, fail, reb };
}
function storPage(t) {
  const v = t.vol, m = v.members, vs = volState(t), dc = s => /^OK|^Good/.test(s) ? '#01A982' : /Failed|Missing/.test(s) ? '#D03B2F' : '#E5A100';
  const D = s => `<span class="dot" style="background:${dc(s)}"></span>${s}`;
  const front = t.bays.map((b, i) => [b, i]).filter(([b, i]) => present(b) || m.includes(i));
  const nNew = front.filter(([b, i]) => present(b) && !m.includes(i)).length, nIn = front.filter(([b]) => present(b)).length;
  const boxes = [...new Set(m.map(i => Math.floor(i / 8) + 1))].map(k => 'Box ' + k).join(', ');
  const cap = ((m.length - 2) * CATALOG.ssd.cap / 1000).toFixed(2);
  const ctl = vs.st === 'OK' ? 'OK' : 'Degraded';
  let h = `<div class="kv" style="margin-bottom:6px"><span>Storage devices</span><span>2 controllers</span><span>Physical drives</span><span>${nIn ? `<b>${nIn}</b> front (${CATALOG.ssd.short}, ${f2(nIn * CATALOG.ssd.cap / 1000)} TB raw)${nNew ? (nNew === nIn ? ', none in a volume yet' : `, ${nNew} of them not in a volume yet`) : ''}` : 'none in the front bays'}; 2 boot (480 GB NVMe M.2)</span><span>Volumes</span><span>${m.length ? 2 : 1}</span></div>`;
  h += `<h6>HPE MR416i-o Gen11 <span style="font-size:13px;color:#5A6670">OCP Slot 14</span></h6><div class="kv" style="margin-bottom:8px"><span>Status</span><span>${D(ctl)}</span><span>Connected to</span><span>the 24 SFF front bays (drive boxes 1 to 3)</span></div>`;
  h += `<table><tr><th>Physical drive</th><th>Model</th><th>Capacity</th><th>Media</th><th>Volume</th><th>Status</th></tr>${front.length ? '' : '<tr><td colspan="6">No drives in the front bays: all 24 bays have blanks.</td></tr>'}${front.map(([b, i]) => {
    const inV = m.includes(i);
    if (!present(b)) return `<tr><td>${bayLoc(i)}</td><td colspan="3">No drive in the bay</td><td>Volume 1</td><td>${D('Missing')}</td></tr>`;
    const s = b.health === 'fault' ? 'Failed' : b.health === 'rebuild' ? `Rebuilding, ${b.pct}%` : inV ? 'OK' : 'OK, unconfigured';
    return `<tr><td>${bayLoc(i)}</td><td>${CATALOG.ssd.name.split(',')[0]}</td><td>960 GB</td><td>SSD, SATA</td><td>${inV ? 'Volume 1' : 'None (new)'}</td><td>${D(s)}</td></tr>`;
  }).join('')}</table>`;
  if (m.length) h += `<table style="margin-top:10px"><tr><th>Volume</th><th>RAID level</th><th>Drives</th><th>Capacity</th><th>Status</th></tr><tr><td>Volume 1</td><td>${v.raid}</td><td>${m.length} (${boxes})</td><td>${cap} TB</td><td>${D(vs.st)}</td></tr></table>`;
  else { const lv = [['RAID 0', 1], ['RAID 1', 2], ['RAID 5', 3], ['RAID 6', 4], ['RAID 10', 4], ['RAID 50', 6], ['RAID 60', 8]], ok = lv.filter(([, k]) => nIn >= k).map(([r]) => r);
    h += `<table style="margin-top:10px"><tr><th>Volume</th><th>RAID level</th><th>Drives</th><th>Capacity</th><th>Status</th></tr><tr><td colspan="5">No volumes on this controller yet.</td></tr></table><div class="note">${nIn ? `With ${nIn} drive${nIn > 1 ? 's' : ''}, the MR416i-o can build ${ok.join(', ')}${nIn < 8 ? ` (more drives open ${lv.filter(([, k]) => nIn < k).map(([r, k]) => `${r} at ${k}`).join(', ')})` : ''}. ` : ''}RAID 1 needs 2 drives, RAID 5 3, RAID 6 and RAID 10 4 (RAID 10 an even number). The volume is created in the controller's configuration tool; the operating system stays on the NS204i-u boot device.</div>`; }
  if (vs.miss.length || vs.fail.length) h += `<div class="note">Volume 1 is degraded: ${[...vs.fail.map(i => `${bayLoc(i)} failed`), ...vs.miss.map(i => `${bayLoc(i)} is missing`)].join('; ')}. Replace the drive in the same bay: the controller rebuilds onto it.</div>`;
  if (nNew) h += `<div class="note">${nNew === 1 ? 'One drive is' : `${nNew} drives are`} not part of a volume yet: ${front.filter(([b, i]) => present(b) && !m.includes(i)).map(([, i]) => bayLoc(i)).join(', ')}. iLO shows them as soon as they are fitted; adding them to a volume is done in the controller's configuration tool.</div>`;
  h += `<h6>HPE NS204i-u Gen11 Boot Controller <span style="font-size:13px;color:#5A6670">Storage Slot 16</span></h6><table><tr><th>Physical drive</th><th>Capacity</th><th>Media</th><th>Status</th></tr>${[1, 2].map(k => `<tr><td>M.2 Bay ${k}</td><td>480 GB</td><td>SSD, NVMe</td><td>${D('OK')}</td></tr>`).join('')}</table>
<table style="margin-top:10px"><tr><th>Volume</th><th>RAID level</th><th>Drives</th><th>Capacity</th><th>Status</th></tr><tr><td>Boot volume</td><td>RAID 1</td><td>2 (M.2 Bays 1 and 2)</td><td>480 GB</td><td>${D('OK')}</td></tr></table>`;
  return h;
}
function dnpPage(t, sub) {
  const n = t.iloCfg.live, ip = liveIp(t), dh = n.dhcp === 'ON';
  if (sub === 'summary') return `<h6 style="margin-top:2px">iLO Dedicated Network Port</h6><div class="kv"><span>NIC in use</span><span>${n.nic === 'ON' ? 'iLO Dedicated Network Port' : n.nic === 'OFF' ? 'None' : 'iLO Shared Network Port'}</span><span>iLO Hostname</span><span>${esc(n.dns)}</span><span>MAC Address</span><span>${LAB.mac}</span><span>Link State</span><span>${n.nic === 'ON' ? 'Link up: 1 Gbps, full duplex (auto-negotiated)' : 'Disabled'}</span></div>
<h6>IPv4 Summary</h6><div class="kv"><span>DHCPv4 Status</span><span>${dh ? 'Enabled' : 'Disabled'}</span><span>Address</span><span>${ip}</span><span>Subnet Mask</span><span>${dh ? '0.0.0.0' : n.mask}</span><span>Default Gateway</span><span>${dh ? '0.0.0.0' : n.gw}</span></div>
${dh && ip === '0.0.0.0' ? '<div class="note">DHCP is enabled, but no DHCP server answers on the management network, so iLO has no IPv4 address on this port. Give it a static address in the iLO 6 Configuration Utility (F9 at POST).</div>' : ''}<h6>IPv6 Summary</h6><div class="kv"><span>Link-local address</span><span>${LAB.ll}</span></div>`;
  if (sub === 'ipv4') {
    const w = t.ilo.wf || { dhcp: n.dhcp, ip: n.ip, mask: n.mask, gw: n.gw }, wd = w.dhcp === 'ON';
    const fin = (k, l) => `<input data-field="w:${k}" value="${esc(wd ? '0.0.0.0' : w[k])}" autocomplete="off" spellcheck="false" aria-label="${l}"${wd ? ' disabled' : ''}>`;
    return `<h6 style="margin-top:2px">IPv4 Configuration</h6><div class="fi"><span>DHCPv4</span><button class="ck" role="checkbox" aria-checked="${wd}" data-act="wDhcp" data-arg=""><i></i>Enable DHCPv4</button><span>IPv4 Address</span>${fin('ip', 'IPv4 Address')}<span>Subnet Mask</span>${fin('mask', 'Subnet Mask')}<span>Default Gateway</span>${fin('gw', 'Default Gateway')}</div>
<div class="note">Applying a change here resets iLO: every iLO session ends, this one too. After a new address, reconnect at that address.</div><div class="bts"><button class="go" data-act="wNetApply" data-arg="">Apply</button><button data-act="wNetRevert" data-arg="">Revert</button></div>`;
  }
  return notSim(subLabel('dnp', sub));
}
function admPage(t, sub) {
  if (sub === 'boot') {
    const L = t.os ? OSI.bootList(t).filter(b => b.os).map(b => b.label) : t.flags.hasOS ? ['Rocky Linux'] : [];
    const rows = [...L.map(l => `${esc(l)} <span style="color:#5A6670">(Storage Slot 16 : HPE NS204i-u Gen11 Boot Controller)</span>`), ...(t.os && t.os.media ? ['iLO Virtual USB 3 : iLO Virtual CD-ROM'] : []), 'Generic USB Boot', 'OCP Slot 15 Port 1 : Broadcom NetXtreme-E Dual 10Gb SFP+ OCP 3.0 Ethernet - NIC (PXE IPv4)', 'OCP Slot 15 Port 1 : Broadcom NetXtreme-E Dual 10Gb SFP+ OCP 3.0 Ethernet - NIC (HTTP(S) IPv4)', 'Embedded UEFI Shell'];
    const once = t.os && t.os.next === 'cd' ? 'cd' : 'none';
    return `<h6 style="margin-top:2px">Boot Mode</h6><div class="kv"><span>Server Boot Mode</span><span>UEFI Mode</span></div><h6>UEFI Boot Order</h6><table><tr><th style="width:36px">#</th><th>Boot option</th></tr>${rows.map((r, i) => `<tr${i === 0 && L.length ? ' class="sel"' : ''}><td>${i + 1}</td><td>${r}</td></tr>`).join('')}</table>
<h6>One-Time Boot Status</h6><div class="tb">${[['none', 'No One-Time Boot'], ['cd', 'CD/DVD Drive']].map(([k, l]) => `<button class="ck" role="radio" aria-checked="${once === k}" data-act="bootOnce" data-arg="${k}"><i></i>${l}</button>`).join('')}</div><p style="font-size:12px;color:#5A6670;margin:6px 0 0">The installed operating system adds its own entry at the top of the UEFI boot order. A one-time boot overrides the order for the next start only.</p>`;
  }
  if (sub !== 'users') return notSim(subLabel('adm', sub));
  const sel = t.ilo.usel;
  return `<h6 style="margin-top:2px">Local Users</h6><div class="tb"><button data-act="iloNote" data-arg="New user">New</button><button data-act="wuEdit" data-arg="">Edit</button><button data-act="iloNote" data-arg="Delete user">Delete</button></div><table><tr><th style="width:26px"></th><th>Login Name</th><th>User Name</th><th>Privileges</th></tr>${t.iloCfg.users.map((u, i) => `<tr class="${sel === i ? 'sel' : ''}"><td><button class="ck" role="checkbox" aria-checked="${sel === i}" aria-label="Select ${esc(u.login)}" data-act="wuSel" data-arg="${i}"><i></i></button></td><td>${esc(u.login)}</td><td>${esc(u.name)}</td><td>${PRIVS.filter(([k]) => u.priv[k] === 'YES').map(([k]) => `<span class="pv">${PSHORT[k]}</span>`).join('') || 'None'}</td></tr>`).join('')}</table><p style="font-size:12px;color:#5A6670;margin:8px 0 0">Tick an account, then Edit to change its name, password or privileges.</p>`;
}
function rcmPage(t, sub) {
  if (sub === 'vm') {
    const md = t.os && t.os.media;
    return `<h6 style="margin-top:2px">Virtual Media Devices</h6><table><tr><th>Device</th><th>Status</th><th>Image</th><th></th></tr><tr><td>Virtual USB Key/Virtual Floppy</td><td>Not connected</td><td></td><td></td></tr><tr><td>Virtual CD/DVD-ROM</td><td>${md ? '<span class="dot" style="background:#01A982"></span>Connected' : 'Not connected'}</td><td>${md ? `${esc(md)} <span style="color:#5A6670">(local image, from the HTML5 remote console)</span>` : ''}</td><td>${md ? '<button data-act="vmEject" data-arg="">Eject Media</button>' : ''}</td></tr></table>
<h6>Connect CD/DVD-ROM</h6><div class="fi"><span>Scripted Media URL</span><input disabled aria-label="Scripted Media URL" value=""><span>Boot on Next Reset</span><button class="ck" role="checkbox" aria-checked="false" disabled><i></i></button></div><div class="note">Scripted media boots an image from a web server. The images for this lab are on your laptop: mount them from the HTML5 remote console, its Virtual Drives menu (the disc icon). Virtual media needs an iLO Advanced licence.</div>`;
  }
  if (sub !== 'launch') return notSim(subLabel('rcm', sub));
  return `<h6 style="margin-top:2px">HTML5 Console</h6><p style="font-size:12.5px;margin:0 0 8px">Opens the server's screen, keyboard and mouse in this browser window, with the console's power menu.</p><button class="go" data-act="rcOpen" data-arg="">Launch</button><h6>.NET Console</h6><p style="font-size:12.5px;margin:0;color:#6A747C">Needs Microsoft Windows and .NET Framework: not available on this laptop.</p>`;
}
const PWEB = { login: 'Login', rc: 'Remote Console', vpr: 'Virtual Power and Reset', vm: 'Virtual Media', bios: 'Host BIOS', cfg: 'Configure iLO Settings', admin: 'Administer User Accounts', nic: 'Host NIC', stor: 'Host Storage', rec: 'Recovery Set' };
function webDialog(t) {
  const c = t.ilo, u = c.ue, d = c.dlg;
  if (d && d.kind === 'netReset') { const w = c.wf; return `<div class="i6md"><div class="i6dw" role="dialog" aria-label="Apply network settings"><h4>iLO reset required</h4><p>Apply the new IPv4 settings: address ${esc(w.ip)}, subnet mask ${esc(w.mask)}, gateway ${esc(w.gw)}? iLO resets to use them. Every iLO session ends, this one too, and iLO answers at its new address after about 30 seconds (a few seconds here).</p><div class="bt"><button class="go" data-act="wDlg" data-arg="ok">Apply and reset iLO</button><button data-act="wDlg" data-arg="cancel">Cancel</button></div></div></div>`; }
  if (!u) return '';
  const fin = (k, v, l, type = 'text') => `<input type="${type}" data-field="w:${k}" value="${esc(v)}" autocomplete="off" spellcheck="false" aria-label="${l}">`;
  return `<div class="i6md"><div class="i6dw" role="dialog" aria-label="Edit user"><h4>Edit User</h4><div class="fi"><span>Login Name</span>${fin('ulogin', u.login, 'Login Name')}<span>User Name</span>${fin('uname', u.name, 'User Name')}</div>
<p style="margin:0 0 8px"><button class="ck" role="checkbox" aria-checked="${u.chpw}" data-act="wuChpw" data-arg=""><i></i>Change password</button></p>${u.chpw ? `<div class="fi"><span>New Password</span>${fin('upw1', u.pw1, 'New Password', 'password')}<span>Confirm Password</span>${fin('upw2', u.pw2, 'Confirm Password', 'password')}</div>` : ''}
<b style="font-size:12.5px">Privileges</b><div class="pg">${Object.keys(PWEB).map(k => `<button class="ck" role="checkbox" aria-checked="${u.priv[k] === 'YES'}" data-act="wuPriv" data-arg="${k}"><i></i>${PWEB[k]}</button>`).join('')}</div>
<div class="er">${esc(u.err || '')}</div><div class="bt"><button class="go" data-act="wuSave" data-arg="">Update User</button><button data-act="wuCancel" data-arg="">Cancel</button></div></div></div>`;
}
function thumb(t) {
  const m = t.con.mode;
  if (m === 'off') return 'No video';
  if (m === 'os') return `Rocky Linux 9.5 (Blue Onyx)\nKernel 5.14.0-503.14.1.el9_5\n\n${LAB.host} login: _`;
  if (m === 'osi') return OSI.thumb(t);
  if (m === 'rbsu') return 'HPE  System Utilities\n\n' + RBT[rbPage(t.rb)];
  if (m === 'noboot') return 'No bootable device was found.';
  return 'HPE ProLiant\nSystem BIOS ' + ROM;
}
function consoleWin(t) {
  const c = t.ilo, m = c.menu;
  let h = `<div class="rcw" role="dialog" aria-label="HTML5 remote console"><div class="rct"><button class="b" data-act="rcMenu" data-arg="main" aria-label="Console menu" title="Menu">${RCI.menu}</button><span class="b" title="Virtual keyboard">${RCI.kbd}</span><button class="b" data-act="vmMenu" data-arg="" aria-label="Virtual Drives" title="Virtual Drives">${RCI.disc}</button><span class="t">${esc(c.host || LAB.svcIp)}</span><span class="b">${RCI.win}</span><span class="b">${RCI.max}</span><span class="b">${RCI.full}</span><button class="b" data-act="rcClose" data-arg="" aria-label="Close the remote console" title="Close">${RCI.x}</button>`;
  if (m) {
    h += `<div class="rcm"><div class="col">${[['power', 'Power'], ['prefs', 'Preferences'], ['info', 'Info'], ['help', 'Help']].map(([k, l]) => `<button data-act="rcMenu" data-arg="${k}" aria-current="${m === k}">${l}${k !== 'help' ? '<span aria-hidden="true">&#8250;</span>' : ''}</button>`).join('')}</div>`;
    if (m === 'power') h += `<div class="col col2">${[['momentary', 'Momentary Press'], ['hold', 'Press and Hold'], ['cold', 'Cold Boot'], ['reset', 'Reset']].map(([k, l]) => `<button data-act="rcPower" data-arg="${k}">${SV('0 0 24 24', PWI[k])}${l}</button>`).join('')}</div>`;
    h += '</div>';
  }
  if (c.vm) { const md = t.os && t.os.media; h += `<div class="rcm" style="left:30px"><div class="col col2" style="min-width:230px">${[['usb', 'Image File Removable Media'], ['cd', md ? `&#10003; Image File CD/DVD-ROM: ${esc(md)}` : 'Image File CD/DVD-ROM'], ['urlusb', 'URL Removable Media'], ['urlcd', 'URL CD/DVD-ROM'], ['folder', 'Folder']].map(([k, l]) => `<button data-act="vmPick" data-arg="${k}">${l}</button>`).join('')}</div></div>`; }
  h += `</div><div class="rcscr" tabindex="0" aria-label="Server screen">${conScreen(t)}</div><div class="rcs"><span>1024 x 768</span><span>${postCode(t) ? 'POST Code : ' + postCode(t) : ''}</span><span>&#128274; SSL</span></div>`;
  const base = [['Esc', 'Esc'], ['Up', '&uarr;'], ['Down', '&darr;'], ['Enter', 'Enter'], ['F7', 'F7'], ['F9', 'F9'], ['F10', 'F10'], ['F11', 'F11'], ['F12', 'F12'], ['CtrlAltDel', 'Ctrl+Alt+Del']], ext = t.os ? OSI.keys(t).filter(([k]) => !base.some(b => b[0] === k)) : [];
  h += `<div class="rck"><span>Keyboard:</span>${base.map(([k, l]) => `<button data-act="rcKey" data-arg="${k}">${l}</button>`).join('')}${ext.map(([k, l]) => `<button data-act="osKey" data-arg="${k}">${l}</button>`).join('')}</div></div>`;
  return h;
}
function shell(t) {
  const c = t.ilo, nav = c.nav, sub = curSub(c), on = isOn(t), ok = !t.bays.some(b => b.health === 'fault');
  let h = `<div class="i6w"><div class="i6"><div class="i6nav"><div class="i6brand">${ICO.logo}<div><b>HPE iLO 6</b><small>${ILOFW}</small></div></div>`;
  h += NAV.map(([id, l]) => `<button class="n" data-act="iloNav" data-arg="${id}" aria-current="${nav === id}">${l}</button>`).join('');
  h += `<button class="i6thumb" data-act="rcOpen" data-arg="" aria-label="Remote console preview: open the HTML5 console">${esc(thumb(t))}</button></div><div class="i6main">`;
  const ic = (svg, tip) => `<span title="${tip}">${svg}</span>`;
  h += `<div class="i6hd"><h3>${esc(pageTitle(nav, sub))}</h3><div class="i6ic">${ic(ICO.power(on), 'Server power: ' + (on ? 'ON' : 'OFF'))}${ic(ICO.uid(t.uid), 'UID: ' + (t.uid ? 'on' : 'off'))}${ic(ICO.check(ok ? G6 : '#E5A100'), 'System health: ' + (ok ? 'OK' : 'degraded'))}${ic(ICO.sun, 'Power and thermal')}${ic(ICO.hex, 'iLO health: OK')}${ic(ICO.shield, 'iLO security: risk')}<button data-act="iloLogout" data-arg="" title="${esc(c.user)}: log out" aria-label="${esc(c.user)}: log out">${ICO.user}</button>${ic(ICO.help, 'Help')}</div></div>`;
  if (SUBS[nav]) h += `<div class="i6tabs">${SUBS[nav].map(([id, l]) => `<button data-act="iloSub" data-arg="${id}" aria-current="${sub === id}">${l}</button>`).join('')}</div>`;
  const body = nav === 'info' ? (sub === 'overview' ? overview(t) : notSim(subLabel(nav, sub))) : nav === 'sys' ? sysPage(t, sub) : nav === 'dnp' ? dnpPage(t, sub) : nav === 'adm' ? admPage(t, sub) : nav === 'rcm' ? rcmPage(t, sub) : notSim(navLabel(nav));
  h += `<div class="i6body">${body}</div></div></div>`;
  h += webDialog(t);
  if (c.rc) h += consoleWin(t);
  if (t.os && t.os.dlg) h += OSI.fileDialog(t, 'Open: image file for the virtual CD/DVD-ROM');
  return h + '</div>';
}
function browser(t) {
  const c = t.ilo, f = c.form, n = t.iloCfg.live;
  const fin = (field, type, label, extra = '') => `<input type="${type}" data-field="${field}" value="${esc(f[field] || '')}" autocomplete="off" spellcheck="false" aria-label="${label}" ${extra}>`;
  let h = `<div class="h6 cueable" role="region" aria-label="Laptop web browser"><p class="cap2">Laptop, web browser${t.net === 'mgmt' ? `: on the management network, address ${t.pcIp}` : t.laptop ? ': Ethernet through the USB adapter to the iLO Service Port' : ': no network cable'}</p><div class="scr">`;
  h += `<div class="abar">${['login', 'shell', 'reset'].includes(c.page) ? '<span class="lock">&#9888; Not secure</span>' : ''}<input data-field="iloUrl" data-enter="iloGo" value="${esc(f.iloUrl || '')}" placeholder="Type an address and press Enter" autocomplete="off" spellcheck="false" aria-label="Browser address bar"><button data-act="iloGo" data-arg="">Go</button></div>`;
  if (c.page === 'blank') h += `<div class="err"><h3>New tab</h3><p>Type the iLO address in the address bar.</p></div>`;
  else if (c.page === 'noreach') h += `<div class="err"><h3>This site can't be reached</h3><p>${esc(c.msg)}</p></div>`;
  else if (c.page === 'cert') h += `<div class="err"><h3>Your connection isn't private</h3><p>The certificate of ${esc(c.host)} is not trusted by this laptop: iLO uses a self-signed certificate until a trusted one is installed, and the browser asks again for every new address. On your own lab network you can continue.</p><p><button data-act="iloCert" data-arg="">Advanced: continue to ${esc(c.host)} (unsafe)</button></p></div>`;
  else if (c.page === 'reset') h += `<div class="err"><h3>iLO is resetting</h3><p>iLO is applying its new network settings. Every iLO session ended, this one too. iLO answers again in about 30 seconds on a real server (a few seconds here), and this page then shows the login page.</p></div>`;
  else if (c.page === 'login') h += `<div class="login"><div class="card"><div class="brand"><span class="logo"></span><b>Hewlett Packard Enterprise</b></div><h3>iLO 6</h3><div class="host">${esc(n.dns)} &middot; ${PROFILE.product}</div><label>Login name</label>${fin('iloUser', 'text', 'Login name')}<label>Password</label>${fin('iloPw', 'password', 'Password', 'data-enter="iloLogin"')}<p style="margin:14px 0 0"><button class="go" data-act="iloLogin" data-arg="">Log In</button></p><div class="msg">${esc(c.msg || '')}</div><p style="font-size:11px;color:#8A949C;margin:12px 0 0">Simulated interface, modelled on iLO 6 ${ILOFW}.</p></div></div>`;
  else if (c.page === 'shell') h += shell(t);
  return h + '</div></div>';
}

Sim.registerView({
  id: 'web', title: 'iLO web interface',
  keep: [
    ['Service Port address', 'On the front iLO Service Port, iLO always answers at 169.254.1.2, whatever its network settings. The dedicated port at the rear uses the address you set.'],
    ['No DHCP, no address', 'A new iLO has DHCP on. If no DHCP server answers on the management network, iLO has no address there (0.0.0.0) until you give it a static one.'],
    ['F9 at POST', 'Restart the server and press F9 when the bottom of the POST screen offers System Utilities. Through iLO, the HTML5 remote console shows that screen and sends the key.'],
    ['DHCP off first', 'In Network Options, set DHCP Enable to OFF: only then can you type the IP address, the subnet mask and the gateway.'],
    ['Save, then iLO resets', 'Network changes take effect after an iLO reset. Every iLO session ends, the remote console too; reconnect after about 30 seconds. The server keeps running.'],
    ['Change the default password', 'Set a new Administrator password, store it in the password vault, and give other people their own accounts with only the privileges they need.'],
    ['Resume the boot', 'Back in System Utilities, Exit and resume system boot lets the server start its operating system.'],
    ['From the web interface', 'Administration, User Management edits accounts; iLO Dedicated Network Port, IPv4 sets the address. Applying a new address resets iLO: reconnect at the new address, where the browser warns about the certificate again.']],
  render(t) { return browser(t); },
  after(t) {
    if (Sim.view !== 'web' || !t.ilo.rc) return;
    if (t.con.mode === 'osi' && document.querySelector('#stage .osx input.osin')) return OSI.focus();
    const d = t.rb.dlg, ae = document.activeElement, free = !ae || ae === document.body;
    if (d && d.kind === 'pw') { const el = document.querySelector(`#stage [data-field="rb:${d.pw1 ? 'pw2' : 'pw1'}"]`); if (el && free) el.focus({ preventScroll: true }); return; }
    if (free) { const s = document.querySelector('#stage .rcscr'); if (s) s.focus({ preventScroll: true }); }
  },
  tray(t) {
    let h = woTable(t);
    h += `<h2>Serial / iLO pull tab</h2>${t.flags.sawTab ? `<table class="dec"><tr><td>iLO user</td><td>${LAB.user}</td></tr><tr><td>Password</td><td style="font-family:var(--mono)">${LAB.pw}</td></tr><tr><td>DNS name</td><td style="font-family:var(--mono)">${LAB.ilo}</td></tr><tr><td>Service Port IP</td><td>${LAB.svcIp}</td></tr></table>` : `<p class="cap" style="font-size:13px">Pull it out on the front panel (Front panel and drives view) and read its iLO side.</p>`}`;
    h += `<h3>iLO 6 User Guide: network settings in the iLO 6 Configuration Utility</h3><ol class="rules" style="padding-left:20px"><li>Open an iLO remote console session</li><li>Restart the server; at POST press F9 (System Utilities)</li><li>System Configuration, then iLO 6 Configuration Utility</li><li>Network Options: DHCP Enable OFF, then IP Address, Subnet Mask, Gateway IP Address</li><li>User Management: Edit/Remove User and Add User</li><li>F12 (Save and Exit), Yes - Save Changes</li><li>OK: iLO resets and the session ends; reconnect after about 30 seconds</li><li>Open the remote console again, Esc back to System Utilities, Exit and resume system boot</li></ol>
<h3>Console keys</h3><ul class="rules"><li>Click the menus and fields on the console screen, as with a mouse in the real console</li><li>The keys under the console send Esc, the arrows, Enter and the function keys; your own keyboard works too while the console has focus</li></ul>
<h3>About these screens</h3><p class="cap" style="font-size:13px">Rebuilt from your screen recording of this server: iLO 6 firmware ${ILOFW}, System ROM ${ROM}. The serial number, MAC address, addresses and passwords are invented lab values. Timings are shortened.</p>`;
    return h;
  }
});

/* ============ actions: browser and iLO web interface ============ */
Sim.onField((f, v) => {
  if (f.startsWith('rb:')) {
    const k = f.slice(3), r = T.rb;
    if (k === 'pw1' || k === 'pw2') { if (r.dlg && r.dlg.kind === 'pw') r.dlg[k] = v; return; }
    rbSet(T, k, v);
    const el = document.querySelector('#stage .rb-pend'); if (el) el.classList.add('on');
    return;
  }
  if (f.startsWith('w:')) {
    const k = f.slice(2), c = T.ilo;
    if (['ip', 'mask', 'gw'].includes(k)) { if (c.wf) c.wf[k] = v; return; }
    if (c.ue) c.ue[{ ulogin: 'login', uname: 'name', upw1: 'pw1', upw2: 'pw2' }[k]] = v;
    return;
  }
  T.ilo.form[f] = v;
});
Sim.on('iloGo', () => {
  const c = T.ilo, u = String(c.form.iloUrl || '').trim().toLowerCase().replace(/\/+$/, '');
  c.url = u; c.msg = '';
  if (!u) { c.page = 'blank'; return; }
  const host = u.replace(/^https?:\/\//, '');
  if (host !== c.host) Object.assign(c, { auth: false, rc: false, menu: null, usel: null, ue: null, wf: null, dlg: null });
  c.host = host;
  if (T.net === 'mgmt') {
    const ip = liveIp(T);
    if (!T.mgmtLink) { c.page = 'noreach'; c.msg = `${host} took too long to respond.`; return say('warn', `No answer: the iLO Management Port at the rear is not cabled to the management switch, so iLO is not on the management network.`); }
    if (ip === '0.0.0.0') { c.page = 'noreach'; c.msg = `${host} took too long to respond.`; return say('warn', `No answer: iLO has no address on the management network yet (DHCP on, and no DHCP server answers). Set its static address first (F9 at POST, on the local console).`); }
    if (host === LAB.svcIp) { c.page = 'noreach'; c.msg = `${host} took too long to respond. That is the iLO Service Port address: it answers only on the front Service Port, and this laptop is on the management network.`; return say('warn', c.msg); }
    if (T.iloCfg.resetAt && [ip, T.iloCfg.oldIp].includes(host)) { c.page = 'noreach'; c.msg = `${host} took too long to respond.`; return say('warn', 'iLO is resetting: wait a few seconds, then try again.'); }
    if (host !== ip) {
      c.page = 'noreach'; c.msg = `${host} took too long to respond.`;
      if (host === T.iloCfg.oldIp) return say('warn', `${host} no longer answers: iLO now uses its new address, ${ip}.`);
      return bad(`Nothing answers at ${host}. iLO's address on the management network is ${ip}.`);
    }
    const nm = a => (ipNum(a) & ipNum('255.255.255.0')) >>> 0;
    if (nm(ip) !== nm(T.pcIp)) { c.page = 'noreach'; c.msg = `${host} took too long to respond.`; return say('warn', `No answer: ${ip} is not on the management network the laptop is on (${WO.subnet}). Give iLO an address in that network.`); }
    if (ip === T.pcIp) { c.page = 'noreach'; c.msg = 'Address conflict.'; return say('warn', `${ip} is the laptop's own address: iLO needs a different one.`); }
  } else if (!T.laptop) { c.page = 'noreach'; c.msg = 'There is no network connection. Connect the laptop to the iLO Service Port first.'; return say('warn', 'The laptop has no network connection.'); }
  else if (host !== LAB.svcIp) {
    c.page = 'noreach';
    if (host === liveIp(T) && host !== '0.0.0.0') { c.msg = `${host} is iLO's address on the management network, at the rear port. This laptop is on the iLO Service Port, where iLO answers at ${LAB.svcIp}.`; return say('warn', c.msg); }
    c.msg = `${host} took too long to respond. On the iLO Service Port, iLO answers at ${LAB.svcIp}.`; return bad(`Nothing answers at ${host}. The pull tab gives the iLO Service Port address: ${LAB.svcIp}.`);
  }
  if (!acOn(T) || !T.flags.iloUp) { c.page = 'noreach'; c.msg = !acOn(T) ? 'iLO does not answer: the server has no power. Connect the power cords.' : T.iloCfg.resetAt ? 'iLO is resetting. Wait a few seconds and try again.' : 'iLO is still starting. Wait a few seconds and try again.'; return say('warn', c.msg); }
  c.page = c.auth ? 'shell' : c.certOk[host] ? 'login' : 'cert';
  say('info', c.page === 'cert' ? 'iLO answered. The browser does not trust its self-signed certificate yet.' : c.page === 'login' ? 'iLO 6 login page.' : 'iLO 6 web interface.');
});
Sim.on('iloCert', () => { const c = T.ilo; c.certOk[c.host] = true; c.page = 'login'; say('info', 'Continued past the certificate warning: the iLO 6 login page.'); });
Sim.on('iloLogin', () => {
  const c = T.ilo, u = String(c.form.iloUser || '').trim(), p = String(c.form.iloPw || '');
  const a = T.iloCfg.users.find(x => x.login.toLowerCase() === u.toLowerCase());
  if (!a || a.pw !== p || a.priv.login !== 'YES') {
    c.msg = 'Login failed: invalid login name or password.';
    if (a && a.pw !== LAB.pw && p === LAB.pw) return bad('Login failed: that is the old password from the pull tab. The Administrator password was changed: use the new one.');
    return bad(`Login failed. ${!a ? `There is no account "${u}". The default account is Administrator.` : a.priv.login !== 'YES' ? 'That account has no Login privilege.' : a.login === 'Administrator' ? 'Check the password: ' + (a.pw === LAB.pw ? 'it is on the pull tab.' : 'it was changed from the pull-tab one.') : 'Check the password.'}`);
  }
  Object.assign(c, { auth: true, user: a.login, page: 'shell', nav: 'info', subs: {}, msg: '' }); T.flags.iloLogin = true; seenNav(T);
  say('ok', `Logged in to iLO 6 as ${a.login}.`);
});
Sim.on('iloLogout', () => { Object.assign(T.ilo, { auth: false, page: 'login', rc: false, menu: null, msg: '' }); T.ilo.form.iloPw = ''; say('info', 'Logged out of iLO.'); });
function seenNav(t) {
  const c = t.ilo, s = curSub(c);
  if (c.nav === 'sys' && t.posted && ['proc', 'mem', 'stor'].includes(s)) c.seen[s] = true;
  if (c.nav === 'sys' && t.posted && s === 'proc' && cpuCount(t) >= 2 && !cpuBad(t)) c.seen.procOk = true;
  if (c.nav === 'info' && s === 'overview') c.seen.overview = true;
  if (c.nav === 'adm' && s === 'boot' && t.os && OSI.newSys(t)) t.flags.osBootSeen = true;
  if (c.nav === 'dnp' && s === 'summary' && t.iloCfg.live.dhcp === 'OFF') c.seen.dnp = true;
  if (c.nav === 'dnp' && s === 'ipv4' && !c.wf) { const n = t.iloCfg.net; c.wf = { dhcp: n.dhcp, ip: n.ip, mask: n.mask, gw: n.gw }; }
  if (c.nav !== 'adm') c.usel = null;
}
Sim.on('iloNav', id => { const c = T.ilo; if (!c.auth) return; c.nav = id; c.subs[id] = SUBS[id] ? SUBS[id][0][0] : ''; seenNav(T); });
Sim.on('iloSub', id => { const c = T.ilo; if (!c.auth) return; c.subs[c.nav] = id; seenNav(T); });
Sim.on('iloNote', k => say('info', `${k}: that page is not part of the simulation yet.`));
/* ---- editing in the web interface: Administration, User Management; iLO Dedicated Network Port, IPv4 ---- */
const webAdmin = () => { const a = T.iloCfg.users.find(u => u.login === T.ilo.user); return !!a && a.priv.admin === 'YES'; };
Sim.on('wuSel', i => { const c = T.ilo; if (!c.auth || c.ue) return; i = +i; c.usel = c.usel === i ? null : i; });
Sim.on('wuEdit', () => {
  const c = T.ilo; if (!c.auth || c.ue) return;
  if (c.usel === null || !T.iloCfg.users[c.usel]) return say('info', 'Tick the account you want to change first, then click Edit.');
  if (!webAdmin()) return bad('This account has no Administer User Accounts privilege.');
  const u = T.iloCfg.users[c.usel];
  c.ue = { idx: c.usel, login: u.login, name: u.name, chpw: false, pw1: '', pw2: '', priv: { ...u.priv }, err: '' };
});
Sim.on('wuChpw', () => { const u = T.ilo.ue; if (!u) return; u.chpw = !u.chpw; if (!u.chpw) { u.pw1 = ''; u.pw2 = ''; } });
Sim.on('wuPriv', k => { const u = T.ilo.ue; if (!u || !(k in u.priv)) return; u.priv[k] = u.priv[k] === 'YES' ? 'NO' : 'YES'; });
Sim.on('wuCancel', () => { T.ilo.ue = null; say('info', 'Edit User cancelled: nothing changed.'); });
Sim.on('wuSave', () => {
  const c = T.ilo, u = c.ue; if (!u) return;
  const list = T.iloCfg.users, login = String(u.login).trim(), name = String(u.name).trim();
  const fail = m => { u.err = m; return bad(m); };
  if (!login) return fail('Login Name cannot be empty.');
  if (!name) return fail('User Name cannot be empty.');
  if (list.some((x, i) => i !== u.idx && x.login.toLowerCase() === login.toLowerCase())) return fail(`The login name "${login}" is already used.`);
  if (u.chpw) { if (!u.pw1) return fail('Type the new password.'); if (u.pw1.length < 8) return fail('The password must be at least 8 characters.'); if (u.pw1 !== u.pw2) return fail('The new password and its confirmation do not match.'); }
  const after = list.map((x, i) => i === u.idx ? { name, login, pw: u.chpw ? u.pw1 : x.pw, priv: { ...u.priv } } : x);
  if (!after.some(x => x.priv.login === 'YES' && x.priv.admin === 'YES')) return fail('At least one account must keep the Login and Administer User Accounts privileges.');
  const own = list[u.idx].login === c.user;
  T.iloCfg.users = after; c.ue = null; if (own) c.user = login;
  say('ok', `User ${login} updated${u.chpw ? ': new password stored' : ''}.${own && u.chpw ? ' This session stays open; the next login needs the new password.' : ''}`);
});
Sim.on('wDhcp', () => { const w = T.ilo.wf; if (!w) return; w.dhcp = w.dhcp === 'ON' ? 'OFF' : 'ON'; if (w.dhcp === 'ON') say('warn', 'Enable DHCPv4: iLO would take its address from a DHCP server. This management network has none.'); });
Sim.on('wNetRevert', () => { const n = T.iloCfg.net; T.ilo.wf = { dhcp: n.dhcp, ip: n.ip, mask: n.mask, gw: n.gw }; say('info', 'Fields set back to the current settings.'); });
Sim.on('wNetApply', () => {
  const c = T.ilo, w = c.wf, n = T.iloCfg.net; if (!w) return;
  const a = T.iloCfg.users.find(u => u.login === c.user); if (!a || a.priv.cfg !== 'YES') return bad('This account has no Configure iLO Settings privilege.');
  if (w.dhcp === 'ON') return bad('Enable DHCPv4 is ticked, but this management network has no DHCP server: iLO would lose its address. Untick it and type the static address.');
  const e = ipErr(w, { ip: 'IPv4 Address', mask: 'Subnet Mask', gw: 'Default Gateway' }); if (e) return bad(e);
  if (w.dhcp === n.dhcp && w.ip.trim() === n.ip && w.mask.trim() === n.mask && w.gw.trim() === n.gw) return say('info', 'Nothing changed: these are the current settings.');
  c.dlg = { kind: 'netReset' };
});
Sim.on('wDlg', b => {
  const c = T.ilo, d = c.dlg; if (!d) return; c.dlg = null;
  if (d.kind !== 'netReset' || b !== 'ok') return say('info', 'Cancelled: the network settings did not change.');
  const w = c.wf; T.iloCfg.net = { ...T.iloCfg.net, dhcp: w.dhcp, ip: w.ip.trim(), mask: w.mask.trim(), gw: w.gw.trim() };
  iloReset(T);
  say('info', `Settings applied: iLO is resetting. This session ended. When iLO is back, it answers at ${T.iloCfg.live.ip}.`);
});

/* ============ actions: remote console ============ */
const powerOk = () => {
  if (T.cover !== 'closed') return bad('The access panel is off: close it before powering on.');
  if (T.baffle === false) return bad('Refit the air baffle before powering on.');
  if (T.rack.pos !== 'in') return bad('Push the server back into the rack first (Rack view).');
  return true;
};
Sim.on('rcOpen', () => {
  const c = T.ilo; if (!c.auth) return;
  const a = T.iloCfg.users.find(u => u.login === c.user);
  if (a && a.priv.rc !== 'YES') return bad('This account has no Remote Console Access privilege.');
  c.rc = true; c.menu = null;
  say('info', 'HTML5 remote console open: the server\'s screen, keyboard and mouse, in the browser. Its menu is the iLO icon at the top left.');
});
Sim.on('rcClose', () => { T.ilo.rc = false; T.ilo.menu = null; T.ilo.vm = false; });
Sim.on('vmMenu', () => { const c = T.ilo; c.menu = null; c.vm = !c.vm; });
Sim.on('vmPick', k => {
  const c = T.ilo; c.vm = false;
  if (k !== 'cd') return say('info', { usb: 'Image File Removable Media: a USB key image (.img). The installers are DVD images: Image File CD/DVD-ROM.', urlusb: 'URL Removable Media: an image on a web server. Not used here.', urlcd: 'URL CD/DVD-ROM: an image on a web server. The images for this lab are on your laptop: Image File CD/DVD-ROM.', folder: 'Folder: shares a laptop folder as a USB drive. Not used here.' }[k]);
  if (T.iloLic !== 'iLO Advanced') return say('warn', 'Virtual media needs an iLO Advanced licence: this iLO has iLO Standard. Not part of this lab.');
  if (!T.os) return say('info', 'Virtual media: not used in this lab. The OS install labs mount their ISO here.');
  if (T.os.media) return OSI.eject(T);
  OSI.openDialog(T, { mount: true }); say('info', 'Choose the image file on your laptop, then Open.');
});
Sim.on('vmEject', () => { if (T.os) OSI.eject(T); });
Sim.on('bootOnce', k => { if (!T.os) return say('info', 'Not used in this lab.'); if (k === 'cd' && !T.os.media) return say('warn', 'No image is on the virtual CD: mount one first (HTML5 remote console, Virtual Drives).'); T.os.next = k === 'cd' ? 'cd' : null; if (k === 'cd') T.os.m.f11 = true; say('ok', k === 'cd' ? 'One-time boot: CD/DVD Drive. The next start boots the image on the virtual CD.' : 'No one-time boot: the server follows its boot order.'); });
Sim.on('rcMenu', m => {
  const c = T.ilo; c.vm = false;
  if (m === 'main') { c.menu = c.menu ? null : 'main'; return; }
  if (m === 'power') { c.menu = c.menu === 'power' ? 'main' : 'power'; return; }
  c.menu = null; say('info', `${{ prefs: 'Preferences', info: 'Info', help: 'Help' }[m] || m}: not part of the simulation yet.`);
});
Sim.on('rcPower', k => {
  T.ilo.menu = null;
  if (k === 'reset' || k === 'cold') {
    if (!isOn(T)) return say('info', `The server is off: ${k === 'reset' ? 'Reset' : 'Cold Boot'} needs it running. Use Momentary Press to power it on.`);
    rebootSrv(T);
    return say('ok', k === 'reset' ? 'Reset: the server restarts at once and runs its power-on self-test. On a production server, shut the operating system down first.' : 'Cold Boot: power is removed and restored; the server runs its power-on self-test.');
  }
  if (k === 'momentary') {
    if (isOn(T)) { T.power = 'standby'; Sim.soundStop('fans', 2.5); return say('info', 'Momentary Press: like a short press of the power button. The operating system shuts down and the server goes to standby.'); }
    if (T.power === 'standby') { if (powerOk() !== true) return; T.power = 'post'; T.postAt = Date.now(); Sim.sound('fans'); return say('ok', 'Momentary Press: the server powers on and runs its power-on self-test.'); }
    return say('info', 'The server has no power: connect the power cords.');
  }
  if (k === 'hold') {
    if (isOn(T)) { T.power = 'standby'; Sim.soundStop('fans', 1.5); return say('warn', 'Press and Hold: a forced power off, like holding the power button. The operating system did not shut down cleanly.'); }
    return say('info', 'The server is already off.');
  }
});
// the local console: monitor and keyboard at the rear, while its view is open; the remote one: the HTML5 console
const localCon = () => Sim.view === 'console' && !!T.crash && T.crash.vga && T.crash.kbd;
const conLive = () => (Sim.view === 'web' && T.ilo.rc) || localCon();
Sim.on('rcKey', k => {
  if (!conLive()) { if (Sim.view === 'console') return bad(!T.crash.kbd ? 'No keyboard: plug a USB keyboard into a rear USB port (Power and iLO view).' : 'No monitor: plug a monitor into the rear VGA port (Power and iLO view).'); return; }
  const c = T.con, ph = c.mode, local = Sim.view === 'console';
  if (k === 'CtrlAltDel') { if (!isOn(T)) return say('info', 'The server is off.'); rebootSrv(T); return say('info', 'Ctrl+Alt+Del: the server restarts and runs its power-on self-test.'); }
  if (ph === 'off') return say('info', local ? 'No signal: the server is off. Press the Power On/Standby button on the front.' : 'No video: the server is off. Power it on from the console menu, Power, Momentary Press.');
  if (ph === 'secure' || ph === 'post') return say('info', k === 'F9' ? 'Too early: wait until the bottom of the POST screen offers F9 System Utilities.' : 'The server is starting: watch the POST screen.');
  if (ph === 'summary') {
    if (k === 'F9') { Object.assign(c, { mode: 'f9', t: Date.now() }); T.flags.f9 = true; return say('ok', 'F9 pressed: System Utilities start.'); }
    if (k === 'F11') { Object.assign(c, { mode: 'f9', t: Date.now() }); T.rb.f11 = true; if (T.os) T.os.m.f11 = true; return say('ok', 'F11 pressed: the One-Time Boot Menu opens.'); }
    const other = { F10: 'F10 starts Intelligent Provisioning', F12: 'F12 starts a network (PXE) boot' }[k];
    return say(other ? 'warn' : 'info', other ? `${other}. Not that one: press F9 for System Utilities.` : 'Press F9 for System Utilities.');
  }
  if (ph === 'f9') return say('info', 'Wait: System Utilities are starting.');
  if (ph === 'rbsu') return rbKey(k);
  if (ph === 'osi') return OSI.key(T, k);
  if (ph === 'boot') return say('info', 'The server is booting.');
  if (k === 'F9') return say('warn', `Too late: POST has finished. Restart the server (${local ? 'Ctrl+Alt+Del' : 'console menu, Power, Reset'}) and press F9 when the POST screen offers it.`);
  return say('info', 'That key does nothing useful at this screen.');
});
function rbKey(k) {
  const r = T.rb, d = r.dlg;
  if (d) { if (d.kind === 'starting') return; if (k === 'Esc') return rbBack(T); if (k === 'Enter') return Sim.actions.rbDlg(d.kind === 'q' ? 'yes' : 'ok'); return; }
  if (k === 'Esc') return rbBack(T);
  const items = rbItems(T, rbPage(r)).filter(rbSelectable);
  if (k === 'Up' || k === 'Down') { r.open = null; let i = items.findIndex(it => it.k === r.sel); i = k === 'Up' ? Math.max(0, i - 1) : Math.min(items.length - 1, i + 1); if (items[i]) r.sel = items[i].k; return; }
  if (k === 'Enter') { const it = items.find(x => x.k === r.sel); if (!it) return; if (it.type === 'link' || it.type === 'act') return Sim.actions.rbGo(it.k); if (it.type === 'sel') return Sim.actions.rbOpen(it.k); if (it.type === 'pw') return Sim.actions.rbPw(it.k); return; }
  if (k === 'F10') {
    if (r.path.length < 3 || !r.pend) return say('info', 'F10: no changes are pending.');
    const res = rbCommit(T); if (!res) return;
    if (res.reset) { r.dlg = { kind: 'reset' }; return say('ok', 'F10: changes saved. iLO must reset to use the new network settings.'); }
    return say('ok', 'F10: changes saved.');
  }
  if (k === 'F12') { if (r.path.length < 3 || !r.pend) return say('info', 'F12: no changes are pending.'); r.dlg = { kind: 'q', to: Math.max(2, r.path.length - 2) }; return; }
  if (k === 'F7') return say('warn', 'F7 loads the default settings of this page. Not used in this lab: nothing was changed.');
  if (k === 'F9' || k === 'F11') return say('info', 'You are already in System Utilities.');
  if (k === 'Enter' || k === 'Space') return;
}
const rbOn = () => conLive() && T.con.mode === 'rbsu';
const rbHas = k => rbItems(T, rbPage(T.rb)).some(it => it.k === k);
Sim.on('rbSel', k => { if (!rbOn() || T.rb.dlg) return; T.rb.sel = k; T.rb.open = null; });
Sim.on('rbGo', k => {
  const r = T.rb; if (!rbOn() || r.dlg || !rbHas(k)) return; r.open = null; r.sel = k;
  if (k === 'syscfg') { if (!r.started) { r.dlg = { kind: 'starting', at: Date.now() }; return; } r.path.push('syscfg'); r.sel = 'bios'; return; }
  if (k === 'ilocfg') { r.path.push('ilocfg'); rbInit(T); r.sel = 'net'; return; }
  if (RBPAR[k]) { r.path.push(k); const first = rbItems(T, k).find(rbSelectable); r.sel = first ? first.k : null; return; }
  if (k === 'exitBoot' || k === 'reboot') { r.dlg = { kind: k }; return; }
  if (k.startsWith('otb:')) {
    const id = k.slice(4);
    if (!['cd', 'disk'].includes(id)) return say('info', { usb: 'Generic USB Boot: no USB drive is plugged in.', pxe: 'PXE boot: no deployment server answers on the data network.', shell: 'The UEFI Shell: not needed here.', app: 'Not needed here.' }[id] || 'Not available.');
    if (T.os) OSI.pickBoot(T, id);
    Object.assign(T.con, { mode: 'boot', t: Date.now() }); T.rb = newRb();
    return say('ok', `One-time boot: ${id === 'cd' ? 'iLO Virtual USB 3 : iLO Virtual CD-ROM, the image on the virtual CD' : 'the operating system on the boot device'}.`);
  }
  say('info', `${RBSTUB[k] || k}: not part of the simulation yet.`);
});
Sim.on('rbCrumb', i => { const r = T.rb; if (!rbOn() || r.dlg) return; i = +i; if (i < r.path.length - 1) rbLeave(T, i); });
Sim.on('rbBack', () => { if (rbOn()) rbBack(T); });
Sim.on('rbOpen', k => { const r = T.rb; if (!rbOn() || r.dlg || !rbHas(k)) return; r.sel = k; r.open = r.open === k ? null : k; });
Sim.on('rbPick', a => {
  const r = T.rb; if (!rbOn() || r.dlg) return;
  const i = a.indexOf('='), k = a.slice(0, i), v = a.slice(i + 1); if (!rbHas(k)) return;
  rbSet(T, k, v); r.open = null; r.sel = k;
  if (k === 'dhcp') say('info', v === 'OFF' ? 'DHCP Enable: OFF. You can now type the IP Address, the Subnet Mask and the Gateway IP Address.' : 'DHCP Enable: ON. iLO takes its address from a DHCP server; the address fields are read only.');
  else if (/^u\d+act$/.test(k)) say(v === 'Delete' ? 'warn' : 'info', v === 'Edit' ? 'Edit: the account\'s login name, password and privileges open below it.' : v === 'Delete' ? 'Delete: the account is removed when you save.' : 'No Change.');
  else if (k === 'factory' && v === 'YES') say('warn', 'Set to factory defaults: YES would erase every iLO setting and account when you save.');
  else if (k === 'nic' && v !== 'ON') say('warn', `Network Interface Adapter: ${v}. The work order uses the dedicated port: ON.`);
});
Sim.on('rbPw', k => { const r = T.rb; if (!rbOn() || r.dlg || !rbHas(k)) return; r.sel = k; r.open = null; r.dlg = { kind: 'pw', key: k, pw1: '', pw2: '', err: '' }; });
Sim.on('rbPwOk', () => {
  const r = T.rb, d = r.dlg; if (!d || d.kind !== 'pw') return;
  if (!d.pw1) { d.err = 'Type the password.'; return; }
  if (d.pw1 !== d.pw2) { d.err = 'The two passwords do not match.'; return bad('The two passwords do not match: type the same password in both fields.'); }
  if (d.pw1.length < 8) { d.err = 'The password must be at least 8 characters.'; return bad('iLO needs a password of at least 8 characters.'); }
  rbSet(T, d.key, d.pw1); r.dlg = null; say('ok', 'Password entered. It is stored when you save the changes.');
});
Sim.on('rbDlg', b => {
  const r = T.rb, d = r.dlg; if (!d) return;
  if (d.kind === 'q') {
    if (b === 'cancel') { r.dlg = null; return; }
    r.dlg = null;
    if (b === 'no') { Object.assign(r, { edit: {}, add: newAdd(), pend: false }); if (r.form) r.form = { ...T.iloCfg.net }; r.misc.factory = 'NO'; r.misc.resetIlo = 'NO'; rbNav(T, d.to); return say('info', 'Changes discarded.'); }
    const res = rbCommit(T); if (!res) return;
    rbNav(T, d.to);
    if (res.reset) { r.dlg = { kind: 'reset' }; return say('ok', 'Changes saved. iLO must reset to use the new network settings.'); }
    return say('ok', 'Changes saved.');
  }
  if (d.kind === 'reset') { if (b !== 'ok') return; const local = Sim.view === 'console'; iloReset(T); return say('info', `iLO is resetting to use its new address, ${liveIp(T)}: ${local ? 'its network sessions end' : 'the remote console and the web session close'}. iLO answers again in a few seconds (about 30 on a real server). The server keeps running, still in System Utilities.`); }
  if (d.kind === 'pw') { if (b === 'ok') return Sim.actions.rbPwOk(); r.dlg = null; return; }
  if (d.kind === 'exitBoot' || d.kind === 'reboot') {
    r.dlg = null; if (b !== 'ok') return;
    if (d.kind === 'reboot') { rebootSrv(T); return say('info', 'Reboot the System: the server restarts.'); }
    Object.assign(T.con, { mode: 'boot', t: Date.now() }); T.rb = newRb(); T.flags.resumed = true;
    return say('ok', 'Exited System Utilities: the server resumes its boot.');
  }
  r.dlg = null;
});

/* ============ timers and the keyboard ============ */
function rerender() {
  const ae = document.activeElement, f = ae && ae.dataset && ae.dataset.field;
  let s = null; try { s = f ? ae.selectionStart : null; } catch (e) { }
  render();
  if (f) { const el = document.querySelector(`#stage [data-field="${f}"]`); if (el) { el.focus({ preventScroll: true }); try { if (s !== null) el.setSelectionRange(s, s); } catch (e) { } } }
}
let webLast = '';
Sim.every(() => {
  conTick(T);
  const osAnim = T.os ? OSI.tick(T) : false;
  const c = T.con, r = T.rb, live = (Sim.view === 'web' && T.ilo.rc) || (Sim.view === 'console' && T.crash && T.crash.vga);
  const anim = live && (c.mode === 'post' || (r.dlg && r.dlg.kind === 'starting')) ? Math.floor(ageOf(r.dlg && r.dlg.at ? r.dlg.at : c.t) / 0.35) : '';
  const k = [c.mode, r.dlg ? r.dlg.kind : '', r.path.join('/'), T.ilo.page, T.iloCfg.resetAt ? 1 : 0, T.flags.iloUp, T.power, anim, T.os ? OSI.sig(T) : '', osAnim && live ? Date.now() : ''].join('|');
  if (k === webLast) return; webLast = k; rerender();
}, 200);
Sim.listen('keydown', e => {
  if (!conLive()) return;
  const tg = e.target, inCon = tg && tg.closest && tg.closest('.rcw, .mon'), inInp = tg && tg.matches && tg.matches('input');
  if (!inCon && tg !== document.body) return;
  const map = { F7: 'F7', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down' };
  let k = map[e.key];
  if (inInp && (k === 'Up' || k === 'Down')) k = null;
  if (T.con.mode === 'osi' && (!k || k === 'F11' || k === 'Esc')) { const o = OSI.mapKey(e); if (o && (!inInp || /^(Alt)?F\d+$|^Esc$/.test(o))) k = o; }
  if (!k && e.key === 'Enter' && !inInp && !(tg.matches && tg.matches('button'))) k = 'Enter';
  if (!k && e.key === 'Delete' && e.ctrlKey && e.altKey) k = 'CtrlAltDel';
  if (!k) return;
  e.preventDefault(); e.stopImmediatePropagation(); Sim.do('rcKey', k);
}, true);
