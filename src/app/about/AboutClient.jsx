"use client";

import styles from "./style.module.scss";
import Image from "next/image";
import Text from "@/common/Text/index";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function AboutPage() {
    const dotsRef = useRef([]);
    const aboutRef = useRef();

    useGSAP(() => {
        gsap.from(dotsRef.current, {
           opacity: 0,
           stagger: 0.3,
           ease: "power4.inOut",
           repeat: -1
        });
    }, { scope: aboutRef });


    return (
        <section className={styles.aboutPage} ref={aboutRef}>
            <div className={styles.body}>
                <div className={styles.heading}>
                    <Text>
                        <h3 className={styles.index}>05</h3>
                        <h1>
                            Trusted Advisors. Tailored Solutions. Real Results.
                        </h1>
                    </Text>
                </div>

                <div className={styles.contentFirst}>
                    <div className={styles.aboutPara}>
                        <Text>
                            <p className={styles.para}>
                                At the heart of our firm is a commitment to understanding your unique business needs.
                                We go beyond compliance — offering strategic insights, proactive planning, and financial clarity
                                that drives long-term value. <br />Whether you're scaling a startup or managing a legacy enterprise,
                                we provide personalized solutions that help you navigate change, manage risk, and seize opportunity.
                            </p>
                        </Text>
                    </div>

                    <div className={styles.imageContainer}>
                        <Image
                            src="/images/us.jpg"
                            alt="About Us"
                            width={300}
                            height={500}
                            className={styles.aboutImage}
                        />
                    </div>
                </div>

                <div className={styles.heading2}>
                    <Text>
                        <h2>
                            <span className={styles.dot} ref={el => (dotsRef.current[0] = el)}>.</span>
                            <span className={styles.dot} ref={el => (dotsRef.current[1] = el)}>.</span>
                            <span className={styles.dot} ref={el => (dotsRef.current[2] = el)}>.</span>
                            Because Every Journey Deserves Direction
                        </h2>
                    </Text>
                </div>

                <div className={styles.because}>
                    <div className={styles.journeyImageContainer}>
                        <Image
                            src="/images/journey.jpg"
                            alt="Navigation"
                            width={390}
                            height={590}
                        />
                    </div>
                    <Text>
                        <p>
                            In the ever-changing world of finance, every decision shapes the path ahead. <br />
                            We believe that every journey — whether you're launching a new venture, expanding your
                            operations, or planning for the future — deserves experienced guidance. <br />
                            Our role is to help you chart a clear course, avoid unnecessary detours, and arrive at your
                            goals with confidence and clarity.
                        </p>
                    </Text>
                </div>
            </div>
        </section>
    );
}
