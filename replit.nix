{ pkgs }: {
  deps = [
    pkgs.lsof
    pkgs.cowsay
    pkgs.bitcoind
    pkgs.lnd
    pkgs.jq
    pkgs.netcat-openbsd
    pkgs.xxd
  ];
}