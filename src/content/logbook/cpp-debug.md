---
title: 数据结构实验中的踩坑日寄
date: 2026-05-01
---

**1.抛弃你那古董的教科书吧，C99 之后不认你的 `void main(void)`，请让你的 `main` 函数返回 `int`!**

**2.要组装成程序，Windows 终端下竟然是一堆乱码，处理好 UTF-8 编码！**

Windows 终端默认采用 GBK 编码，而用 VS Code 编写，MingW 编译的 C/C++ 程序默认采用 UTC-8 编码，这个时候我们就要好好处理一下终端的编码问题，一个解决方案是：

```cpp
// Using UTF-8
#ifdef _WIN32
#include <windows.h>
#endif

//...

int main()
{
// Using UTF-8
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif 

//logic

return 0;
}
```

**3.你是单文件编译爱好者？别再 `#include` 一大堆 `*.cpp` 了！**

如果你是一个单文件编译的~~极简主义~~或~~极客狂人~~，收起你那 `#include` 的一大堆 `*.cpp` 文件辣。编译器告诉我们，这样会导致一个 `*.cpp` 文件被多次编译，会报错 `xxx is redefined xxx`。

更推荐的做法是用 `.h` 文件写函数的声明，然后在文件中 `#include`，在编译的时候编译所有的 `*.cpp` 文件！


