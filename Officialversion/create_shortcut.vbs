Set objArgs = WScript.Arguments
If objArgs.Count < 5 Then
    WScript.Quit
End If

' 参数顺序:
' 0: 目标快捷方式路径
' 1: 目标程序路径
' 2: 起始位置
' 3: 描述
' 4: 图标路径

shortcutPath = objArgs(0)
targetPath = objArgs(1)
workingDir = objArgs(2)
description = objArgs(3)
iconPath = objArgs(4)

Set shell = WScript.CreateObject("WScript.Shell")
Set shortcut = shell.CreateShortcut(shortcutPath)

shortcut.TargetPath = targetPath
shortcut.WorkingDirectory = workingDir
shortcut.Description = description
shortcut.IconLocation = iconPath

shortcut.Save
