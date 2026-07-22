---
title: 解决 Windows 虚拟内存放在 D 盘无效
date: 2026-07-23
---
笔记本的 C 盘之前爆掉了，把虚拟内存从 C 盘移出去改到 D 盘了。当时改完发现 GUI 生效了后面就没再管了。实际上：

> 她妈的我说最近打欧卡的时候怎么老是句柄错误内存溢出直接崩溃了。我之前把虚拟内存转移到 D 盘了结果这傻逼 Windows GUI 和注册表上生效了实际上压根没生效。我后台还开着 WSL 的虚拟层，全靠 32 GB 的物理内存顶着，不 OOM 才怪！今晚上 VS Code 崩了才查出来！

用 OpenCode 大调查了一番之后发现这似乎是个通病[note: 此事在 Microsoft 官方论坛，Reddit 等一众论坛上均有记载]，折腾了一大圈，尝试的方法包括而不仅限于：

- 反复重启
- 关闭快速启动（通过 `powercfg /h off`）
- 设置 C 盘分页文件为 512 MB (似乎是 Microsoft 工程师承认的所谓“魔法数字”？)

实际上，上面的方法都无效！根因在于某个神秘的注册表项：`PagefileOnOsVolume = 1` —— 这个注册表键强制页面文件只能用系统盘 C。[note: 不知道原理是什么，可能是某个傻逼“系统优化“软件留下的杰作，抑或就是 Microsoft PC Manager 或者 Windows 11 的自身设计缺陷]

```powershell
$ Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" -Name PagefileOnOsVolume | Format-List
PagefileOnOsVolume : 1
PSPath             : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session 
                     Manager\Memory Management
PSParentPath       : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session 
                     Manager
PSChildName        : Memory Management
PSDrive            : HKLM
PSProvider         : Microsoft.PowerShell.Core\Registry
```

最终的解决方案是通过带管理员权限的命令提示符修改注册表，如下：

```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v PagefileOnOsVolume /t REG_DWORD /d 0 /f
```

这在我的电脑上起作用，如果您读到了这篇 logbook，我希望这也对您的电脑工作！