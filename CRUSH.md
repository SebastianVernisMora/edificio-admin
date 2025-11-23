# Edificio Admin - Sistema Operacional

**Fecha:** 2025-11-23 07:40 UTC  
**Estado:** ✅ FUNCIONANDO - SIN LOOPS

---

## 🚀 PM2 Comandos

```bash
pm2 status                  # Ver estado
pm2 logs edificio-admin     # Ver logs
pm2 restart edificio-admin  # Reiniciar
pm2 save                    # Guardar config
```

---

## 🔑 Credenciales

**CONTRASEÑA: `Gemelo1` (todas las cuentas)**

```
Admin: admin@edificio205.com / Gemelo1
```

**URL:** `http://ec2-18-223-32-141.us-east-2.compute.amazonaws.com`

---

## 📊 Estado

```yaml
PM2: ✅ Online (PID 33450)
Backend: ✅ Funcionando
Frontend: ✅ Sin loops
Módulos: Cuotas, Gastos, Fondos agregados
DB: ✅ 41KB, 20 usuarios
```

---

## 🎯 Funcionalidades

✅ Login/Logout  
✅ Cuotas  
✅ Gastos  
✅ Fondos  
❌ Dashboard (deshabilitado)  
❌ Usuarios (deshabilitado)  
❌ Anuncios (deshabilitado)

---

## 🔧 Si hay loop

```javascript
// Console (F12):
localStorage.clear();
// Reload: Ctrl+Shift+R
```

---

**Sistema operacional** ✅
