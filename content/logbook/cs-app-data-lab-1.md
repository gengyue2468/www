---
comment: true
title: CS App Datalab 做题记录（上）
date: 2026-08-04
---

去 https://csapp.cs.cmu.edu/3e/labs.html 下载学生包，应该是一个叫 Self-Study Handout 的 .tar 压缩包，用 `wget` 保存下来然后 `tar -xvaf` 解压一下。需要 `make` 编译一下 `dlc` 程序但是发现似乎会报错：

```bash
gengyue@gengyue-laptop:~/csapp/data-lab/datalab-handout$ make
gcc -O -Wall -m32 -lm -o btest bits.c btest.c decl.c tests.c
In file included from btest.c:16:
/usr/include/stdio.h:28:10: fatal error: bits/libc-header-start.h: No such file or directory
   28 | #include <bits/libc-header-start.h>
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~
compilation terminated.
In file included from decl.c:1:
/usr/include/stdio.h:28:10: fatal error: bits/libc-header-start.h: No such file or directory
   28 | #include <bits/libc-header-start.h>
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~
compilation terminated.
In file included from /usr/lib/gcc/x86_64-linux-gnu/14/include/limits.h:210,
                 from /usr/lib/gcc/x86_64-linux-gnu/14/include/syslimits.h:7,
                 from /usr/lib/gcc/x86_64-linux-gnu/14/include/limits.h:34,
                 from tests.c:3:
/usr/include/limits.h:26:10: fatal error: bits/libc-header-start.h: No such file or directory
   26 | #include <bits/libc-header-start.h>
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~
compilation terminated.
make: *** [Makefile:11: btest] Error 1
```

好像是制定了 `-m32` 编译但是默认的只有 64 位的开发库，需要安装一下 `multilib` 之后重新编译：

```bash
sudo apt update
sudo apt install gcc-multilib g++-multilib libc6-dev-i386
```

之后再 `make` 就正常了，之后可以通过 `./dlc -F <func>` 来测试题目，测试之前同样需要重新 `make` 编译一次

### bitXor

提供的示例是 4 和 5，需要计算这两个数的异或，传统按位运算类似这样：
```
4:100
5:101

0 0 1
```

从真值表可以推出 $p \XOR q = (p \AND \NOT q) \OR (\NOT p \AND q)$，也就是这样的 C 代码：

```c
x ^ y = (x & ~ y) | (~ x & y)
```

但是不能用 `|`，根据 De Morgan's laws 有：$ \NOT (p \AND q) = \NOT p \OR \NOT q$，也就是：

```c
~(p & q)=~p | ~q

~(~(x & ~y) & ~(~x & y))
```

### tmin 

要求返回补码表示中的数的最小的那个，题目默认 32 位整数，也就是 `1000 0....0 0000`，把 `1 << 31` 输出就行了

顺便复习一下补码的性质：`-x = ~x + 1`

### isTmax

要求判断输入一个 x 是不是补码表示的数中最大的那个，也就是 `0111 111....11 1111`

一开始没发现不能用 <<，写了个 `return !((x + 1) ^ (1 << 31))` 提交上去发现没过

想了想 `tmax + 1` 好像就是 `tmin` 也就是 `~tmax`，可以利用一下这个性质写出 `!((x + 1) ^ ~x)`。不过 -1 也满足这个性质需要特判排除一下，最后 `return !((x + 1) ^ ~x) & !!~x` 就行了。

### allOddBits

需要判断一个数的二进制表示里的所有奇数位是不是都是 1。一个比较自然的想法是：

```c
return (x >> 1) & (x >> 3) & (x >> 5) & (x >> 7) & (x >> 9) &
  (x >> 11) & (x >> 13) & (x >> 15) & (x >> 17) & (x >> 19) &
  (x >> 21) & (x >> 23) & (x >> 25) & (x >> 27) & (x >> 29) &
  (x >> 31) & 1;
```

但是操作符超了，hmmmm

想了一下可以把 32 位二进制拆成 4 组，每组正好 8 位即一个 Byte，把它们两两 & 运算叠加在一起然后用一个 0xaa （也就是 0b10101010）作为 mask 检查奇数位是不是都是 1

最终: 

```c
  return !((x & (x >> 8) & (x >> 16) & (x >> 24) & 0xaa)^0xaa) ;
```

### negate

求一个数的相反数hh，利用 `tmin` 中提到的性质直接取反＋1 就行了，`return ~x + 1`，比较简单。
