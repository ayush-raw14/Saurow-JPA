"use client";

import styles from './style.module.scss';
import Text from '@/common/Text';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {

    const heroRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);

    useGSAP(() => {
        gsap.from(textRef.current, {
            x: -300,
            duration: 0.6,
            opacity: 0.8,
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top bottom",
                end: "top top",
                scrub: 2,
            }
        });

        gsap.from(imageRef.current, {
           x: 300,
           duration: 0.6,
           opacity: 0.8,
           scrollTrigger: {
               trigger: heroRef.current,
               start: "top bottom",
               end: "top top",
               scrub: 2,
           }
        });
    }, { scope: heroRef });
    return (
        <section className={styles.hero} ref={heroRef}>
            <div className={styles.body}>
                <div className={styles.content}>
                    <div
                        className={styles.text}
                        ref={textRef}
                    >
                        <Text>
                            <p className={styles.para1}>
                                Empowering businesses with
                                clarity, compliance, and
                                confidence.
                            </p>

                            <p className={styles.para2}>
                                Precision in numbers, vision in growth.
                            </p>
                        </Text>
                    </div>

                    <div
                        className={styles.imageWrapper}
                        ref={imageRef}
                    >
                        <Image
                            src="/images/graph.jpg"
                            alt="Data graph showing growth"
                            width={500}
                            height={500}
                            className={styles.image}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
