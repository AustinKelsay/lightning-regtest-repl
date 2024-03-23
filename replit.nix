{ pkgs }: {
  deps = [
    pkgs.cowsay
    pkgs.bitcoind
    pkgs.lnd
    pkgs.jq
    pkgs.netcat-openbsd
    pkgs.xxd
  ];
}