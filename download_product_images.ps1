# Download real product photos using direct Unsplash photo IDs
$assetsDir = "d:\WebSite-Pro\client\public\assets"

# Each entry: filename => direct Unsplash image URL (known working photo IDs)
$products = [ordered]@{
    # ELECTRONICS
    "product-headphones.png"         = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
    "product-smartwatch.png"         = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"
    "product-earbuds.png"            = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop"
    "product-keyboard.png"           = "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=800&fit=crop"
    "product-quantum-headphones.png" = "https://images.unsplash.com/photo-1546435770-a3e736062af6?w=800&h=800&fit=crop"
    "product-solar-watch.png"        = "https://images.unsplash.com/photo-1542496658-e33a6d0d238f?w=800&h=800&fit=crop"
    "product-gaming-mouse.png"       = "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=800&fit=crop"
    "product-drone.png"              = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&h=800&fit=crop"
    "product-smart-hub.png"          = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop"
    "product-wireless-charger.png"   = "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=800&h=800&fit=crop"
    "product-bt-speaker.png"         = "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop"
    "product-curved-monitor.png"     = "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&h=800&fit=crop"
    "product-desk-lamp.png"          = "https://images.unsplash.com/photo-1594220388571-7ad3a5f004d1?w=800&h=800&fit=crop"
    "product-gaming-headset.png"     = "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&h=800&fit=crop"
    "product-power-bank.png"         = "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop"
    "product-fitness-band.png"       = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop"
    "product-portable-ssd.png"       = "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=800&fit=crop"
    "product-drawing-tablet.png"     = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop"
    "product-air-purifier.png"       = "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=800&fit=crop"
    "product-projector.png"          = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=800&fit=crop"
    "product-ereader.png"            = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop"
    "product-mesh-wifi.png"          = "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&h=800&fit=crop"
    "product-ring-light.png"         = "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&h=800&fit=crop"
    "product-noise-machine.png"      = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop"
    "product-smart-plug.png"         = "https://images.unsplash.com/photo-1557075877-0e4e8e3c6dd8?w=800&h=800&fit=crop"
    "product-smart-scale.png"        = "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=800&fit=crop"
    "product-webcam.png"             = "https://images.unsplash.com/photo-1587380353484-29e3a08e4fe9?w=800&h=800&fit=crop"
    "product-turntable.png"          = "https://images.unsplash.com/photo-1618580298722-8f99fa25c52e?w=800&h=800&fit=crop"
    "product-dock-station.png"       = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop"
    "product-doorbell.png"           = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop"

    # CLOTHING
    "product-jacket.png"             = "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=800&fit=crop"
    "product-tee.png"                = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"
    "product-sweater.png"            = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop"
    "product-hoodie.png"             = "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&h=800&fit=crop"
    "product-jeans.png"              = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop"
    "product-sunglasses.png"         = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=800&fit=crop"
    "product-scarf.png"              = "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop"
    "product-backpack.png"           = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop"
    "product-evening-gown.png"       = "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=800&fit=crop"
    "product-linen-shirt.png"        = "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=800&fit=crop"
    "product-denim-jacket.png"       = "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop"
    "product-cargo-pants.png"        = "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop"
    "product-polo-shirt.png"         = "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop"
    "product-flannel-shirt.png"      = "https://images.unsplash.com/photo-1490725263030-1f0521cec8ec?w=800&h=800&fit=crop"
    "product-down-jacket.png"        = "https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop"
    "product-puffer-vest.png"        = "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop&crop=top"
    "product-running-tights.png"     = "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=800&h=800&fit=crop"
    "product-base-layer.png"         = "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=800&h=800&fit=crop"
    "product-wool-blazer.png"        = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop"
    "product-field-jacket.png"       = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop"
    "product-chino-shorts.png"       = "https://images.unsplash.com/photo-1562183241-840b8af0721e?w=800&h=800&fit=crop"
    "product-joggers.png"            = "https://images.unsplash.com/photo-1594938298603-c8148c4b4471?w=800&h=800&fit=crop"
    "product-beanie.png"             = "https://images.unsplash.com/photo-1510598155485-1c3e5d7ba1ed?w=800&h=800&fit=crop"
    "product-bucket-hat.png"         = "https://images.unsplash.com/photo-1589756822899-c9e8e5e7edea?w=800&h=800&fit=crop"
    "product-belt.png"               = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=bottom"
    "product-pocket-square.png"      = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop&crop=top"
    "product-canvas-tote.png"        = "https://images.unsplash.com/photo-1597403491447-3ab08f8e44dc?w=800&h=800&fit=crop"
    "product-leather-backpack.png"   = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop"
    "product-overcoat.png"           = "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop"

    # FOOTWEAR
    "product-sneaker.png"            = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop"
    "product-oxford.png"             = "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&h=800&fit=crop"
    "product-chelsea-boots.png"      = "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop"
    "product-suede-loafers.png"      = "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&h=800&fit=crop"
    "product-velvet-loafers.png"     = "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&h=800&fit=crop"
    "product-velvet-dress-shoes.png" = "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&h=800&fit=crop&crop=left"
    "product-hiking-boots.png"       = "https://images.unsplash.com/photo-1520219306100-ec4afba7b785?w=800&h=800&fit=crop"
    "product-work-boots.png"         = "https://images.unsplash.com/photo-1574966739987-65c6c8afa6d3?w=800&h=800&fit=crop"
    "product-espadrilles.png"        = "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800&h=800&fit=crop"
    "product-sheepskin-slippers.png" = "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop&crop=top"
    "product-leather-sandals.png"    = "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=800&fit=crop"
    "product-slip-on-mules.png"      = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop"
    "product-trail-running-pro.png"  = "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=800&fit=crop"
    "product-basketball-highs.png"   = "https://images.unsplash.com/photo-1556906781-9a412961d28a?w=800&h=800&fit=crop"
    "product-knit-runners.png"       = "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop"
    "product-canvas-sneakers.png"    = "https://images.unsplash.com/photo-1463100099107-aa0980ccd543?w=800&h=800&fit=crop"
    "product-desert-boots.png"       = "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&h=800&fit=crop"
    "product-boat-shoes.png"         = "https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=800&h=800&fit=crop"
    "product-brogue-shoes.png"       = "https://images.unsplash.com/photo-1559707489-50b29d9b0e28?w=800&h=800&fit=crop"
    "product-leather-derby.png"      = "https://images.unsplash.com/photo-1541804793-c257d9d2a779?w=800&h=800&fit=crop"
    "product-puffer-boots.png"       = "https://images.unsplash.com/photo-1574166533897-4d433fd4680c?w=800&h=800&fit=crop"
    "product-rain-boots.png"         = "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800&h=800&fit=crop"
    "product-barefoot-sneaker.png"   = "https://images.unsplash.com/photo-1475180429745-7b0df9c47e27?w=800&h=800&fit=crop"
    "product-platform-sneakers.png"  = "https://images.unsplash.com/photo-1597248881519-db089f890820?w=800&h=800&fit=crop"
    "product-skate-shoes.png"        = "https://images.unsplash.com/photo-1570464197285-9949814674a7?w=800&h=800&fit=crop"
    "product-tennis-shoes.png"       = "https://images.unsplash.com/photo-1562183241-840b8af0721e?w=800&h=800&fit=crop&crop=bottom"
    "product-trail-sneakers.png"     = "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop"
    "product-cycling-shoes.png"      = "https://images.unsplash.com/photo-1565986636780-e96d13d96d21?w=800&h=800&fit=crop"
    "product-monk-strap-shoes.png"   = "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&h=800&fit=crop"
    "product-wool-clogs.png"         = "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=800&fit=crop"
}

$total = $products.Count
$count = 0
$failed = @()

foreach ($entry in $products.GetEnumerator()) {
    $count++
    $filename = $entry.Key
    $url = $entry.Value
    $filepath = Join-Path $assetsDir $filename

    try {
        Write-Host "[$count/$total] $filename" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $filepath -TimeoutSec 30 -ErrorAction Stop | Out-Null
        $fileSize = (Get-Item $filepath).Length
        if ($fileSize -gt 10000) {
            Write-Host "  OK ($([math]::Round($fileSize/1024))KB)" -ForegroundColor Green
        } else {
            Write-Host "  Warning: small file ($fileSize bytes)" -ForegroundColor Yellow
            $failed += $filename
        }
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed += $filename
    }

    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Total: $total | Success: $($total - $failed.Count) | Failed: $($failed.Count)"
if ($failed.Count -gt 0) {
    Write-Host "Failed images:"
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
